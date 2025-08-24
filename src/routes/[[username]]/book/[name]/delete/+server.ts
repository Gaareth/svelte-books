import { json } from "@sveltejs/kit";

import { authorize } from "../../../../../auth";

import type { RequestEvent } from "./$types";

import { prisma } from "$lib/server/prisma";

export async function POST(req: RequestEvent) {
  const { requestedAccount } = await authorize(
    await req.locals.auth(),
    req.params.username
  );

  const { id } = await req.request.json();
  if (id === undefined) {
    return json({ success: false });
  }

  const book = await prisma.book.delete({
    where: {
      id: id,
      accountId: requestedAccount.id,
    },
  });
  if (!book) {
    return json({ success: false });
  }

  return json({ success: true });
}
