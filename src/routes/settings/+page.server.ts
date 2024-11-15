import {
  type RequestHandler,
  error,
  json,
  type ServerLoadEvent,
} from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { extractBookApiData, extractCategories } from "$lib/server/db/utils.js";

import type { Book, BookApiData } from "@prisma/client";
import type { queriedBookFull } from "$appTypes";
import { arrMax, delay, getErrorMessage, zip } from "$lib/utils";
import { getBookApiData, queryBooksFull } from "../book/api/api.server";
import { SSE_DATA, type SSE_EVENT } from "../book/api/update_all/sse";
import { getAccountByUsername, getAccountIdfromSession } from "../../auth";
import {
  updateData,
  type settingsApiReloadResult,
  createConnections,
  type settingsApiCreateResult,
} from "./apidata";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

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

    // for (const [key, value] of formData.entries()) {
    //   const match = key.match(/^list\[(.+)\]$/); // Matches keys like "list[List 1]"
    //   if (match) {
    //     const listName = match[1];
    //     listData[listName] = value === "on"; // Convert "on" to `true`, others to `false`
    //   }
    // }
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
  const session = await locals.auth();
  if (session?.user?.name == null) {
    error(401);
  }

  const lists = await prisma.bookList.findMany({
    include: {
      _count: {
        select: {
          books: true,
        },
      },
    },
  });
  console.log("LOAAAD");

  const isPublic = (
    await prisma.account.findUnique({
      where: {
        username: session.user?.name,
      },
      select: {
        isPublic: true,
      },
    })
  )?.isPublic;

  if (isPublic == null) {
    console.warn("isPublic is null but account exists??");

    error(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return {
    globalVisibility: isPublic ? "public" : "private",
    lists,
  };
}
