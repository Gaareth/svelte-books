import { error, json, type RequestEvent } from "@sveltejs/kit";
import z from "zod";

import { authorize } from "$lib/auth/auth";

import {
  READING_ACTIVITY_TYPES,
  type ReadingActivityStatusType,
} from "$lib/constants/enums";
import { prisma } from "$lib/server/prisma";
import {
  cloneReadingActivity,
  createReadingActivity,
  getOrCreateReadingActivityStatus,
} from "../api.server";

const transformSchema = z.object({
  readingActivityId: z.coerce.number(),
  targetStatus: z.nativeEnum(READING_ACTIVITY_TYPES),
});

async function transformAddCurrentDate(
  accountId: string,
  readingActivityId: number,
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

  if (
    targetStatus === READING_ACTIVITY_TYPES.FINISHED ||
    targetStatus === READING_ACTIVITY_TYPES.DID_NOT_FINISH ||
    targetStatus === READING_ACTIVITY_TYPES.PAUSED
  ) {
    update["dateFinishedId"] = dateId;
  } else if (targetStatus === READING_ACTIVITY_TYPES.READING) {
    update["dateStartedId"] = dateId;
  }

  return await cloneReadingActivity(accountId, readingActivityId, update);
}

async function continueReading(
  accountId: string,
  readingActivityId: number,
  readingActivityStatusId: number
) {
  return await cloneReadingActivity(accountId, readingActivityId, {
    readingActivityStatusId,
  });
}

async function createNewReadFromScratch(accountId: string, bookId: string) {
  const now = new Date();
  const oDt = {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  };

  return await createReadingActivity(
    accountId,
    bookId,
    undefined,
    READING_ACTIVITY_TYPES.READING,
    oDt
  );
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

  const currentStatus = readingActivity.status.status;

  let newReadingActivity;

  switch (targetStatus) {
    case READING_ACTIVITY_TYPES.READING: {
      if (currentStatus === READING_ACTIVITY_TYPES.PAUSED) {
        newReadingActivity = await continueReading(
          accountId,
          readingActivityId,
          targetReadingActivityStatusId
        );
      } else {
        newReadingActivity = await createNewReadFromScratch(
          accountId,
          readingActivity.bookId
        );
      }
      break;
    }

    case READING_ACTIVITY_TYPES.FINISHED:
    case READING_ACTIVITY_TYPES.DID_NOT_FINISH:
    case READING_ACTIVITY_TYPES.PAUSED: {
      newReadingActivity = await transformAddCurrentDate(
        accountId,
        readingActivityId,
        targetStatus,
        targetReadingActivityStatusId
      );
      break;
    }

    case READING_ACTIVITY_TYPES.ACQUIRED:
    case READING_ACTIVITY_TYPES.TO_READ: {
      newReadingActivity = await cloneReadingActivity(
        accountId,
        readingActivityId,
        {
          readingActivityStatusId: targetReadingActivityStatusId,
        }
      );
      break;
    }

    default:
      throw error(400, "Unsupported target status: " + targetStatus);
  }

  if (!newReadingActivity) {
    throw error(500, "Failed to transform reading activity");
  }

  return json({ success: true });
}
