import { error, json, type RequestEvent } from "@sveltejs/kit";

import { authorize } from "../../../../../auth";

import { prisma } from "$lib/server/prisma";

export async function POST(req: RequestEvent) {
  await authorize(await req.locals.auth(), req.params.username);

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
