import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

import { authorize, isReadingActivityPublic } from "$lib/auth/auth";

import {
  READING_STATUS_VALUES,
  type ReadingActivityStatusType,
} from "$lib/constants/enums";
import { getReadingActivity } from "$lib/server/db/utils";

export async function load({ locals, params }: ServerLoadEvent) {
  if (
    !READING_STATUS_VALUES.includes(
      params.listName as ReadingActivityStatusType
    )
  ) {
    return error(StatusCodes.NOT_FOUND);
  }

  const readingActivityStatus = params.listName as ReadingActivityStatusType;

  const { sessionAccount, requestedAccount } = await authorize(
    await locals.auth(),
    params.username,
    async (requestedAccount, session) =>
      await isReadingActivityPublic(
        requestedAccount.id,
        session,
        readingActivityStatus
      )
  );

  const username = params.username;

  const isAuthorizedToModify =
    (sessionAccount?.id === requestedAccount.id || sessionAccount?.isAdmin) ??
    false;

  const readingActivity = await getReadingActivity(
    requestedAccount.id,
    sessionAccount,
    isAuthorizedToModify,
    readingActivityStatus
  );

  return {
    readingActivity,
    username,
    isAuthorizedToModify,
    listName: params.listName,
    exists: true,
  };
}
