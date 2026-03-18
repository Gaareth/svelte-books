import { fail, type ServerLoadEvent } from "@sveltejs/kit";

import { getAccountIdfromSession, userAuth } from "$lib/auth/auth";
import { parseFormArray } from "$lib/schemas/utils";
import { SSE_DATA } from "../book/api/update_all/sse";
import {
  createConnections,
  updateData,
  type settingsApiCreateResult,
  type settingsApiReloadResult,
} from "./apidata";

import { prisma } from "$lib/server/prisma";
import {
  READING_ACTIVITY_TYPES,
  VISIBILITY_TYPES,
} from "$src/lib/constants/enums";
import z from "zod";

export type SETTINGS_SSE_ACTIONS = "try_add" | "reload";

export async function load({ locals }: ServerLoadEvent) {
  const account = await userAuth(await locals.auth());

  const readingActivityLists = await prisma.readingActivityStatus.findMany({
    where: { accountId: account.id },
  });

  return {
    globalVisibility: account.visibility,
    readingActivityLists,
  };
}

export const actions = {
  reload: async ({ locals }) => {
    const session = await locals.auth();
    const accountId = await getAccountIdfromSession(session);

    SSE_DATA[accountId] = { items: 0, msg: "", max: 0, id: "reload" };

    try {
      const diffs = await updateData(accountId);
      // console.log(SSE_DATA[accountId]);

      const response: settingsApiReloadResult = {
        success: true,
        ...diffs,
      };

      SSE_DATA[accountId].msg = "done";
      return response;
    } catch (e: unknown) {
      const response: settingsApiReloadResult = {
        success: false,
        diffs: [],
        booksUpdated: 0,
      };

      SSE_DATA[accountId].msg = "done";
      return response;
    }
  },

  try_add: async ({ locals, request }) => {
    const session = await locals.auth();
    const accountId = await getAccountIdfromSession(session);

    const formData = await request.formData();
    const connect_all = formData.get("connect-all") == "on";

    SSE_DATA[accountId] = { items: 0, msg: "", max: 0, id: "try_add" };

    const result = await createConnections(accountId, connect_all);
    const response: settingsApiCreateResult = {
      success: result.errorsBooks.length == 0 ? true : false,
      ...result,
    };

    // console.log(response);
    // console.log(JSON.stringify(response));
    SSE_DATA[accountId].msg = "done";
    return response;
  },

  editVisibility: async ({ locals, request }) => {
    const session = await locals.auth();
    const accountId = await getAccountIdfromSession(session);
    const formData = await request.formData();

    let formDataObject = Object.fromEntries(formData);
    // console.log(formDataObject);

    // const listNameVisibility = parseFormArray(
    //   formDataObject,
    //   "listNameVisibility"
    // );

    const readingActivityVisibility = parseFormArray(
      formDataObject,
      "readingActivityVisibility"
    );

    // @ts-ignore
    formDataObject["readingActivityVisibility"] = readingActivityVisibility;

    const visibilitySchema = z.object({
      globalVisibility: z.nativeEnum(VISIBILITY_TYPES).optional(),
      readingActivityVisibility: z.array(
        z.tuple([
          z.nativeEnum(READING_ACTIVITY_TYPES),
          z.nativeEnum(VISIBILITY_TYPES),
        ])
      ),
    });

    const result = visibilitySchema.safeParse(formDataObject);
    if (result.success) {
      const { globalVisibility, readingActivityVisibility } = result.data;

      if (globalVisibility != null) {
        await prisma.account.update({
          where: {
            id: accountId,
          },
          data: {
            visibility: globalVisibility,
          },
        });
      }

      for (const [status, visibility] of readingActivityVisibility) {
        await prisma.readingActivityStatus.update({
          where: {
            status_accountId: {
              status,
              accountId,
            },
          },
          data: {
            visibility,
          },
        });
      }

      return { success: true };
    }

    return fail(400, {
      success: false,
      error: result.error.flatten().fieldErrors,
    });
  },
};

// export async function POST({ request, locals }) {
//   const session = await locals.getSession();
//   if (!session) {
//     throw error(401);
//   }

//   // await updateData();
//   const result = await createConnections();

//   return json({
//     success: result.errorsBooks.length == 0 ? true : false,
//     ...result,
//   });

//   // return json({success: false})
// }
