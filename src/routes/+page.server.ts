import { loadBooks } from "$lib/server/db/utils";
import { prisma } from "$lib/server/prisma";
import type { Book } from "@prisma/client";

export async function load({ url }: any) {
  return await loadBooks();
}
