import { authorize, getReadingActivityVisibility } from "../../auth";

import type { ServerLoadEvent } from "@sveltejs/kit";

import { READING_STATUS, VISIBILITY } from "$appTypes";
import { getReadingActivity } from "$lib/server/db/utils";

export async function load({ locals, params }: ServerLoadEvent) {
  const { sessionAccount, requestedAccount } = await authorize(
    await locals.auth(),
    params.username,
    (requestedAccount) => requestedAccount?.isPublic
  );

  const username = params.username;

  const isAuthorizedToModify =
    sessionAccount?.id === requestedAccount.id || sessionAccount?.isAdmin;

  return {
    isCurrentlyReadingPublic:
      (await getReadingActivityVisibility(
        requestedAccount.id,
        READING_STATUS.READING
      )) === VISIBILITY.PUBLIC,
    readingActivity: await getReadingActivity({
      accountId: requestedAccount.id,
    }),
    username,
    isAuthorizedToModify,
  };
}
