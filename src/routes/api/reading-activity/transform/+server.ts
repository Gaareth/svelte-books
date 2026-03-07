import { error, json, type RequestEvent } from "@sveltejs/kit";
import z from "zod";

import { authorize } from "../../../../auth";

import {
  READING_ACTIVITY_TYPES,
  type ReadingActivityStatusType,
} from "$lib/constants/enums";
import { prisma } from "$lib/server/prisma";
import {
  cloneReadingActivity,
  getOrCreateReadingActivityStatus,
} from "../api.server";

const transformSchema = z.object({
  readingActivityId: z.coerce.number(),
  targetStatus: z.nativeEnum(READING_ACTIVITY_TYPES),
});

async function transformAddCurrentDate(
  readingActivityId: number,
  accountId: string,
  targetStatus: ReadingActivityStatusType,
  targetReadingActivityStatusId: number
) {
  const now = new Date();
  const dateId = (
    await prisma.optionalDatetime.create({
      data: {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        hour: now.getHours(),
        minute: now.getMinutes(),
      },
    })
  ).id;

  const update: Record<string, unknown> = {
    readingActivityStatusId: targetReadingActivityStatusId,
  };

  if (targetStatus === READING_ACTIVITY_TYPES.FINISHED) {
    update["dateFinishedId"] = dateId;
  } else if (targetStatus === READING_ACTIVITY_TYPES.READING) {
    update["dateStartedId"] = dateId;
  }

  return await cloneReadingActivity(accountId, readingActivityId, update);
}

export async function POST(req: RequestEvent) {
  const { requestedAccount } = await authorize(await req.locals.auth());
  const accountId = requestedAccount.id;

  const f = await req.request.formData();

  const result = transformSchema.safeParse(Object.fromEntries(f));
  if (!result.success) {
    throw error(400, "Missing readingActivityId");
  }

  const { readingActivityId, targetStatus } = result.data;
  const readingActivity = await prisma.readingActivity.findFirst({
    where: { id: readingActivityId, accountId },
    include: {
      status: true,
    },
  });
  if (!readingActivity) {
    throw error(404, "Reading activity not found");
  }

  const targetReadingActivityStatusId = await getOrCreateReadingActivityStatus(
    accountId,
    targetStatus
  );

  let newReadingActivity;
  if (
    targetStatus === READING_ACTIVITY_TYPES.FINISHED ||
    targetStatus === READING_ACTIVITY_TYPES.READING
  ) {
    newReadingActivity = await transformAddCurrentDate(
      readingActivityId,
      accountId,
      targetStatus,
      targetReadingActivityStatusId
    );
  } else if (
    targetStatus === READING_ACTIVITY_TYPES.ACQUIRED ||
    targetStatus === READING_ACTIVITY_TYPES.PAUSED ||
    targetStatus === READING_ACTIVITY_TYPES.DID_NOT_FINISH ||
    targetStatus === READING_ACTIVITY_TYPES.TO_READ
  ) {
    newReadingActivity = await cloneReadingActivity(
      accountId,
      readingActivityId,
      {
        readingActivityStatusId: targetReadingActivityStatusId,
      }
    );
  } else {
    throw error(400, "Unsupported target status");
  }

  if (!newReadingActivity) {
    throw error(500, "Failed to transform reading activity");
  }

  return json({ success: true });
}
