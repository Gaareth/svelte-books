import { json } from "@sveltejs/kit";

import { authorize } from "$lib/auth/auth";

import type { RequestEvent } from "./$types";

import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
import { prisma } from "$lib/server/prisma";

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
      include: {
        status: true,
      },
    });
    if (!readingActivity) {
      return json({ success: false });
    }

    if (readingActivity.status.status == READING_ACTIVITY_TYPES.ACQUIRED) {
      const ownership = await prisma.ownership.delete({
        where: {
          bookId: readingActivity.bookId,
        },
      });

      if (!ownership) {
        return json({ success: false });
      }
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error deleting reading activity:", error);
    return json({ success: false });
  }
}
