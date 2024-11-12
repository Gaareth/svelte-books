import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { prisma } from "$lib/server/prisma";

export async function POST(req: RequestEvent) {
  const session = await req.locals.getSession();
  if (!session) {
    error(401);
  }

  const { id } = await req.request.json();
  if (id === undefined) {
    return { success: false };
  }

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
