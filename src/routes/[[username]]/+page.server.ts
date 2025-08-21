import { checkBookAuth } from "../../auth";

import type { ServerLoadEvent } from "@sveltejs/kit";

import { getReadingActivity } from "$lib/server/db/utils";

export async function load({ locals, params }: ServerLoadEvent) {
  const accountId = await checkBookAuth(locals, params, "Read");
  const username = params.username;

  return {
    readingActivity: await getReadingActivity({ accountId }),
    username,
  };
}
