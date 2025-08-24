import { type ServerLoadEvent } from "@sveltejs/kit";

import { getAccountIdfromSession, userAuth } from "../../auth";
import { parseFormArray } from "../../schemas";
import { SSE_DATA } from "../book/api/update_all/sse";
import {
  createConnections,
  updateData,
  type settingsApiCreateResult,
  type settingsApiReloadResult,
} from "./apidata";

import { prisma } from "$lib/server/prisma";

export type SETTINGS_SSE_ACTIONS = "try_add" | "reload";

export const actions = {
  reload: async ({ locals }) => {
    const session = await locals.auth();
    const accountId = await getAccountIdfromSession(session);

    SSE_DATA[accountId] = { items: 0, msg: "", max: 0, id: "reload" };

    const diffs = await updateData(accountId);
    // console.log(SSE_DATA[accountId]);

    const response: settingsApiReloadResult = {
      success: true,
      ...diffs,
    };

    SSE_DATA[accountId].msg = "done";
    return response;
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

    const formDataObject = Object.fromEntries(formData);
    // console.log(formDataObject);

    // const listNameVisibility = parseFormArray(
    //   formDataObject,
    //   "listNameVisibility"
    // );

    const readingActivityVisibility = parseFormArray(
      formDataObject,
      "readingActivityVisibility"
    );

    const isPublic = formData.get("isPublic");
    // console.log(isPublic);

    if (isPublic != null) {
      await prisma.account.update({
        where: {
          id: accountId,
        },
        data: {
          isPublic: isPublic == "true",
        },
      });
    }

    for (const list of readingActivityVisibility) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const status = list[0];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const visibility = list[1];

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

export async function load({ locals }: ServerLoadEvent) {
  const account = await userAuth(await locals.auth());
  // const lists = await prisma.bookList.findMany({
  //   where: { accountId: account.id },
  //   include: {
  //     _count: {
  //       select: {
  //         books: true,
  //       },
  //     },
  //   },
  // });

  const readingActivityLists = await prisma.readingActivityStatus.findMany({
    where: { accountId: account.id },
  });
  // console.log("Reading Activity Lists:", readingActivityLists);

  const isPublic = account.isPublic;

  return {
    globalVisibility: isPublic ? "public" : "private",
    readingActivityLists,
  };
}
