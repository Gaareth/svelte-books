import { json } from "@sveltejs/kit";

import type { RequestEvent } from "./$types";

import { prisma } from "$lib/server/prisma";
import { authorize } from "../../../../auth";

export async function POST(req: RequestEvent) {
  const { requestedAccount } = await authorize(await req.locals.auth());
  const accountId = requestedAccount.id;

  const { id } = await req.request.json();
  if (id === undefined) {
    return json({ success: false });
  }

  try {
    const readingActivity = await prisma.readingActivity.delete({
      where: {
        id: id,
        accountId,
      },
    });
    if (!readingActivity) {
      return json({ success: false });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error deleting reading activity:", error);
    return json({ success: false });
  }
}
