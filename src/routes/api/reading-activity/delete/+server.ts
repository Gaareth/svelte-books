import { prisma } from "$lib/server/prisma";
import { json } from "@sveltejs/kit";
import { checkBookAuth } from "../../../../auth";
import type { RequestEvent } from "./$types";

export async function POST(req: RequestEvent) {
  await checkBookAuth(req.locals, req.params);

  const { id } = await req.request.json();
  if (id === undefined) {
    return json({ success: false });
  }

  try {
    const readingActivity = await prisma.readingActivity.delete({
      where: {
        id: id,
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
