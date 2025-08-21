import { checkBookAuth } from "../../auth";

import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ locals, params }: ServerLoadEvent) {
  const accountId = await checkBookAuth(locals, params, "Read");
  const username = params.username;
}
