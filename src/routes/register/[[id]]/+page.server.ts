import {
  redirect,
  type RequestEvent,
  type ServerLoadEvent,
} from "@sveltejs/kit";
import { z } from "zod";

import { createLists } from "../../../../prisma/seed-initial";
import { hashPassword } from "../../../auth";

import { prisma } from "$lib/server/prisma";
import { StatusCodes } from "http-status-codes";

export async function load({ locals, params }: ServerLoadEvent) {
  if (await locals.auth()) {
    return redirect(StatusCodes.SEE_OTHER, "/");
  }

  const id = params.id;
  const serverSettings = await prisma.serverSettings.findFirst({
    include: {
      registrationCodes: true,
    },
  });

  const registrationCodes = serverSettings?.registrationCodes;
  const validCode = registrationCodes?.find((c) => c.code == id);

  return {
    showForm: serverSettings?.registrationPossible || validCode != null,
    validCode: validCode?.code,
    invalidCode: validCode == null ? id : undefined,
  };
}

export const actions = {
  redirectRegistration: async (event: RequestEvent) => {
    if (await event.locals.auth()) {
      return redirect(StatusCodes.SEE_OTHER, "/");
    }
    const formData = Object.fromEntries(await event.request.formData());
    const schema = z.object({
      code: z.string(),
    });

    const result = schema.safeParse(formData);

    if (result.success) {
      const { code } = result.data;

      const serverSettings = await prisma.serverSettings.findFirst({
        include: {
          registrationCodes: true,
        },
      });

      const registrationCodes = serverSettings?.registrationCodes;

      const valid = registrationCodes?.find((c) => c.code == code);

      if (valid != null) {
        redirect(302, "/register/" + code);
      } else {
        return { success: false };
      }
    } else {
      return { success: false };
    }
  },
  register: async (event: RequestEvent) => {
    if (await event.locals.auth()) {
      return redirect(StatusCodes.SEE_OTHER, "/");
    }

    const formData = Object.fromEntries(await event.request.formData());

    const schema = z.object({
      username: z.string().min(1).max(64).trim(),
      password: z.string().min(8).max(256),
      code: z.string().min(1).trim(),
    });

    const result = schema.safeParse(formData);

    if (result.success) {
      const { username, password, code } = result.data;

      const serverSettings = await prisma.serverSettings.findFirst({
        include: {
          registrationCodes: true,
        },
      });

      const registrationCodes = serverSettings?.registrationCodes;
      const validCode = registrationCodes?.find((c) => c.code == code);

      if (!serverSettings?.registrationPossible) {
        if (!validCode) {
          return { success: false, message: "Invalid registration code" };
        }
      }

      const accountExists = await prisma.account.findFirst({
        where: { username },
      });

      if (accountExists) {
        return {
          success: false,
          message: "Usernames have to be unique.\nPlease choose another name",
        };
      }

      const { hash, salt } = await hashPassword(password);

      const account = await prisma.account.create({
        data: {
          username: username,
          password_hash: hash,
          password_salt: salt,
        },
      });

      // create default lists, like read, to-read
      await createLists(account.id);

      if (validCode) {
        await prisma.registrationCode.update({
          where: {
            code,
          },
          data: {
            timesUsed: validCode?.timesUsed + 1,
          },
        });
      }
      //TODO: add logic to delete if maxUsed have been reached

      redirect(302, "/login");
      // return { success: true };
    } else {
      const { fieldErrors: errors } = result.error.flatten();

      return { success: false, errors };
    }
  },
};
