import {
  redirect,
  type RequestEvent,
  type ServerLoadEvent,
} from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { z } from "zod";
import { createAccount } from "../../../auth.js";

export async function load({ locals, params }: ServerLoadEvent) {
  const id = params.id;
  const serverSettings = await prisma.serverSettings.findFirst({
    include: {
      registrationCodes: true,
    },
  });

  const registrationCodes = serverSettings?.registrationCodes;

  return {
    showForm:
      serverSettings?.registrationPossible ||
      registrationCodes?.find((c) => c.code == id),
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
      console.log(valid);
      console.log(registrationCodes);

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
    });

    const result = schema.safeParse(formData);

    if (result.success) {
      const { username, password } = result.data;

      const accountExists = await prisma.account.findFirst({
        where: { username },
      });
      // todo: only show warning with are you sure or something.
      if (accountExists) {
        return {
          success: false,
          message: "Username have to be unique.\nPlease choose another name",
        };
      }

      await createAccount(username, password);

      redirect(302, "/login");
      // return { success: true };
    } else {
      const { fieldErrors: errors } = result.error.flatten();

      return { success: false, errors };
    }
  },
};
