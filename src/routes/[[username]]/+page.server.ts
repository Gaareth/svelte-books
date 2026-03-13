import {
  authorize,
  handlePublicOrAuthenticatedAccount,
  isReadingActivityPublic,
} from "$lib/auth/auth";

import type { ServerLoadEvent } from "@sveltejs/kit";

import { getReadingActivity } from "$lib/server/db/utils";
import { ReadingActivityType } from "$prismaClient";

export async function load({ locals, params }: ServerLoadEvent) {
  const { sessionAccount, requestedAccount } = await authorize(
    await locals.auth(),
    params.username,
    handlePublicOrAuthenticatedAccount
  );

  const username = params.username;

  const isAuthorizedToModify =
    sessionAccount?.id === requestedAccount.id || sessionAccount?.isAdmin;

  const readingActivity = await getReadingActivity({
    accountId: requestedAccount.id,
  });

  const isCurrentlyReadingPublic =
    isReadingActivityPublic(
      requestedAccount.id,
      sessionAccount,
      ReadingActivityType.READING
    ) || isAuthorizedToModify;

  return {
    isCurrentlyReadingPublic,
    readingActivity,
    username,
    isAuthorizedToModify,
  };
}
