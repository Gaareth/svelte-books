import { loadBooks } from "$lib/server/db/utils";

export async function load() {
  return await loadBooks();
}
