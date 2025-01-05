import { prisma } from "$lib/server/prisma";
import { error, json, type RequestEvent } from "@sveltejs/kit";

export async function POST(req: RequestEvent) {
  const session = await req.locals.getSession();
  if (!session) {
    error(401);
  }

  const { id } = await req.request.json();
  if (id === undefined) {
    error(400);
  }

  const book = await prisma.book.findUnique({
    where: {
      id: id,
    },
  });
  if (!book) {
    return { success: false };
  }

  return json({ success: true, book });
}
