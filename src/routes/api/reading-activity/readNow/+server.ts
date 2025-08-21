import { error, json, type RequestEvent } from "@sveltejs/kit";
import z from "zod";

import { checkBookAuth } from "../../../../auth";

import { READING_STATUS } from "$appTypes";
import { prisma } from "$lib/server/prisma";

export async function POST(req: RequestEvent) {
  await checkBookAuth(req.locals, req.params);

  const f = await req.request.formData();
  const readNowSchema = z.object({
    readingActivityId: z.coerce.number(),
  });
  const result = readNowSchema.safeParse(Object.fromEntries(f));
  if (!result.success) {
    throw error(400, "Missing readingActivityId");
  }

  const { readingActivityId } = result.data;
  const now = new Date();
  await prisma.readingActivity.update({
    where: { id: readingActivityId },
    data: {
      dateFinished: {
        create: {
          day: now.getDate(),
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          hour: now.getHours(),
          minute: now.getMinutes(),
        },
      },
      status: READING_STATUS.FINISHED,
    },
  });

  return json({ success: true });
}
