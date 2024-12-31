import {
  error,
  redirect,
  type RequestEvent,
  type ServerLoadEvent,
} from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { getAccountByUsername } from "../../auth";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export async function load({ locals }: ServerLoadEvent) {
  const session = await locals.auth();
  if (session?.user?.name == null) {
    error(StatusCodes.UNAUTHORIZED);
  }

  const account = await getAccountByUsername(session?.user?.name);
  if (!account?.isAdmin && !import.meta.env.DEV) {
    error(StatusCodes.FORBIDDEN);
  }

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
    },
  });

  const users = accounts.map((a) => {
    return {
      username: a.username,
      lists: a.bookList,
    };
  });

  return { serverSettings, users };
}

function generateRegistrationCode() {
  return uuidv4();
}

export const actions = {
  save: async (event: RequestEvent) => {
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
