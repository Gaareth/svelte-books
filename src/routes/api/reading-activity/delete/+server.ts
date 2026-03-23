import { json } from "@sveltejs/kit";

import { authorize } from "$lib/auth/auth";

import type { RequestEvent } from "./$types";

import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
import { prisma } from "$lib/server/prisma";
import { Prisma } from "$prismaClient";

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
      try {
        const ownership = await prisma.ownership.delete({
          where: {
            bookId: readingActivity.bookId,
          },
        });

        if (!ownership) {
          return json({ success: false });
        }
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            // no ownership found, can be ignored
          } else {
            throw error;
          }
        }
        console.error("Error deleting ownership:", error);
      }
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error deleting reading activity:", error);
    return json({ success: false });
  }
}
