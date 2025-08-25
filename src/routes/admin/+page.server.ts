import { type RequestEvent, type ServerLoadEvent } from "@sveltejs/kit";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { adminAuth } from "../../auth";

import { prisma } from "$lib/server/prisma";

export async function load({ locals }: ServerLoadEvent) {
  await adminAuth(await locals.auth());

  const serverSettings = await prisma.serverSettings.findFirstOrThrow({
    include: { registrationCodes: true },
  });

  const accounts = await prisma.account.findMany({
    where: {},
    include: {
      books: {
        select: {
          bookList: true,
        },
      },
      bookList: true,
      readingActivityStatus: true,
    },
  });

  const users = accounts.map((a) => {
    return {
      username: a.username,
      numBooks: a.books.length,
      readingActivityLists: a.readingActivityStatus,
    };
  });

  return { serverSettings, users };
}

function generateRegistrationCode() {
  return uuidv4();
}

export const actions = {
  save: async (event: RequestEvent) => {
    await adminAuth(await event.locals.auth());

    const formData = await event.request.formData();
    const registrationOpen = formData.get("registrationOpen") != null;

    await prisma.serverSettings.update({
      where: {
        id: 1,
      },
      data: {
        registrationPossible: registrationOpen,
      },
    });

    return { success: true };
  },
  addRegistrationCode: async (event: RequestEvent) => {
    await adminAuth(await event.locals.auth());

    return await prisma.serverSettings.update({
      where: {
        id: 1,
      },
      data: {
        registrationCodes: {
          create: {
            code: generateRegistrationCode(),
          },
        },
      },
    });
  },

  deleteRegistrationCode: async (event: RequestEvent) => {
    await adminAuth(await event.locals.auth());

    const formData = Object.fromEntries(await event.request.formData());

    const schema = z.object({
      code: z.string(),
    });

    const result = schema.safeParse(formData);

    if (result.success) {
      const { code } = result.data;
      await prisma.registrationCode.delete({
        where: {
          code,
        },
      });

      return { success: true };
    } else {
      return { success: false };
    }
  },
};
