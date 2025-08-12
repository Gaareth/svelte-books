import { getReadBooks } from "$lib/server/db/utils";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { checkBookAuth } from "../../auth";

export async function load({ locals, params }: ServerLoadEvent) {
  const accountId = await checkBookAuth(locals, params, "Read");
  const username = params.username;

  return {
    books: (await getReadBooks({ accountId })).books,
    username,
  };
}
