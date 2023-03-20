import { loadBooks } from "$lib/server/db/utils";

export async function load({ url }: any) {
  return await loadBooks();
}
