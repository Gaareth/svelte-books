import { error, json, type RequestEvent } from "@sveltejs/kit";
import z from "zod";

import { authorize } from "$lib/auth/auth";

import {
  READING_ACTIVITY_TYPES,
  type ReadingActivityStatusType,
} from "$lib/constants/enums";
import { prisma } from "$lib/server/prisma";
import { BookOwnership } from "$prismaClient";
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
        timezoneOffset: now.getTimezoneOffset(),
      },
    })
  ).id;

  return await cloneReadingActivity(accountId, readingActivityId, {
    readingActivityStatusId: targetReadingActivityStatusId,
    dateFinishedId: dateId,
  });
}

async function continueReading(
  accountId: string,
  readingActivityId: number,
  readingActivityStatusId: number
) {
  return await cloneReadingActivity(accountId, readingActivityId, {
    readingActivityStatusId,
    dateFinishedId: null,
  });
}

async function createNewFromScratch(
  accountId: string,
  bookId: string,
  targetStatus: ReadingActivityStatusType
) {
  const now = new Date();
  const oDt = {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    timezoneOffset: now.getTimezoneOffset(),
  };

  return await createReadingActivity(
    accountId,
    bookId,
    undefined,
    targetStatus,
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
        newReadingActivity = await createNewFromScratch(
          accountId,
          readingActivity.bookId,
          targetStatus
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
        targetReadingActivityStatusId
      );
      break;
    }

    case READING_ACTIVITY_TYPES.TO_READ: {
      newReadingActivity = await createNewFromScratch(
        accountId,
        readingActivity.bookId,
        targetStatus
      );
      break;
    }

    case READING_ACTIVITY_TYPES.ACQUIRED: {
      newReadingActivity = await createNewFromScratch(
        accountId,
        readingActivity.bookId,
        targetStatus
      );

      if (newReadingActivity) {
        const ownership = await prisma.ownership.create({
          data: {
            bookId: readingActivity.bookId,
            location: null,
            status: BookOwnership.OWNED,
            acquiredAtId: newReadingActivity.dateStartedId,
          },
        });

        if (!ownership) {
          throw error(500, "Failed to create ownership");
        }
      }

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
