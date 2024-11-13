import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { prisma } from "$lib/server/prisma";
import { checkBookAuth } from "../../../../../auth";

export async function POST(req: RequestEvent) {
  checkBookAuth(req.locals, req.params);

  const { id } = await req.request.json();
  if (id === undefined) {
    return { success: false };
  }

  // this means that an authorized user can delete any book of any user
  const book = await prisma.book.delete({
    where: {
      id: id,
    },
  });
  if (!book) {
    return { success: false };
  }

  return json({ success: true });
}
