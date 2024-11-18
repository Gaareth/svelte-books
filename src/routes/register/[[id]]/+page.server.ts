import {
  redirect,
  type RequestEvent,
  type ServerLoadEvent,
} from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { z } from "zod";
import { hashPassword } from "../../../auth";

export async function load({ locals, params }: ServerLoadEvent) {
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
    const formData = Object.fromEntries(await event.request.formData());

    const schema = z.object({
      username: z.string().min(1).max(64),
      password: z.string().min(8).max(256),
      code: z.string().min(1),
    });

    const result = schema.safeParse(formData);

    if (result.success) {
      const { username, password, code } = result.data;

      const serverSettings = await prisma.serverSettings.findFirst({
        include: {
          registrationCodes: true,
        },
      });

      if (!serverSettings?.registrationPossible) {
        const registrationCodes = serverSettings?.registrationCodes;
        const validCode = registrationCodes?.find((c) => c.code == code);
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

      await prisma.account.create({
        data: {
          username: username,
          password_hash: hash,
          password_salt: salt,
        },
      });

      redirect(302, "/login");
      // return { success: true };
    } else {
      const { fieldErrors: errors } = result.error.flatten();

      return { success: false, errors };
    }
  },
};
