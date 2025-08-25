import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

import { authorize, isReadingActivityPublic } from "../../../../auth";

import { READING_STATUS, READING_STATUS_VALUES } from "$appTypes";
import { getReadingActivity } from "$lib/server/db/utils";

export async function load({ locals, params }: ServerLoadEvent) {
  console.log("Loading reading activity for list:", params.listName);

  if (!READING_STATUS_VALUES.includes(params.listName as READING_STATUS)) {
    return error(StatusCodes.NOT_FOUND);
  }

  const readingActivityStatus = params.listName as READING_STATUS;

  const { sessionAccount, requestedAccount } = await authorize(
    await locals.auth(),
    params.username,
    async (requestedAccount) =>
      await isReadingActivityPublic(requestedAccount.id, readingActivityStatus)
  );

  const username = params.username;
  const readingActivity = await getReadingActivity(
    { accountId: requestedAccount.id },
    readingActivityStatus
  );

  return {
    readingActivity,
    username,
    listName: params.listName,
    exists: true,
  };
}
