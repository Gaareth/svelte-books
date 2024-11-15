import { loadBooks } from "$lib/server/db/utils";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { checkBookAuth } from "../../auth";

export async function load({ locals, params }: ServerLoadEvent) {
  const accountId = await checkBookAuth(locals, params);

  return {
    books: (await loadBooks({ accountId })).books,
    currentlyReading: (await loadBooks({ accountId }, "Reading")).books,
  };
}
