import type {
  optionalDatetimeSchema,
  storyGraphSchema,
} from "$lib/schemas/schemas";
import type z from "zod";

import { type ReadingActivityStatusType } from "$lib/constants/enums";
import { createAllReadingActivityStatus } from "$lib/server/db/create";
import { prisma } from "$lib/server/prisma";
import type { Prisma } from "$prismaBrowser";

const readingActivityIncludes = {
  rating: true,
  dateStarted: true,
  dateFinished: true,
  storyGraphs: true,
  book: true,
  status: true,
};

type readingActivityInput = Prisma.ReadingActivityGetPayload<{
  include: {
    rating: true;
    dateStarted: true;
    dateFinished: true;
    storyGraphs: true;
    book: true;
    status: true;
  };
}>;

export async function cloneReadingActivity(
  accountId: string,
  readingActivityId: number,
  readingActivityOverwrite: Partial<readingActivityInput> = {}
) {
  const readingActivity = await prisma.readingActivity.findUnique({
    where: { id: readingActivityId, accountId },
    include: {
      ...readingActivityIncludes,
    },
  });

  if (!readingActivity) {
    throw new Error("Reading activity not found");
  }

  const clonedReadingActivity = await prisma.readingActivity.create({
    data: {
      accountId,
      bookId: readingActivityOverwrite?.bookId ?? readingActivity.bookId,
      readingActivityStatusId:
        readingActivityOverwrite?.readingActivityStatusId ??
        readingActivity.readingActivityStatusId,
      dateStartedId:
        readingActivityOverwrite?.dateStartedId ??
        readingActivity.dateStartedId,
      dateFinishedId:
        readingActivityOverwrite?.dateFinishedId ??
        readingActivity.dateFinishedId,
      rating: readingActivity.rating
        ? {
            create: {
              ...(readingActivityOverwrite?.rating ?? readingActivity.rating),
            },
          }
        : undefined,
      storyGraphs: readingActivity.storyGraphs
        ? {
            create: {
              ...(readingActivityOverwrite?.storyGraphs ??
                readingActivity.storyGraphs),
            },
          }
        : undefined,
    },
  });

  return clonedReadingActivity;
}

export async function getOrCreateReadingActivityStatus(
  accountId: string,
  status: ReadingActivityStatusType
): Promise<number> {
  const getRaStatus = async () =>
    await prisma.readingActivityStatus.findUniqueOrThrow({
      where: {
        status_accountId: {
          status,
          accountId,
        },
      },
    });

  try {
    return (await getRaStatus()).id;
  } catch (error) {
    console.error(
      "Error retrieving or creating reading activity status:",
      error
    );
    await createAllReadingActivityStatus(accountId, true);
    return (await getRaStatus()).id;
  }
}

export async function createReadingActivity(
  accountId: string,
  bookId: string,
  stars: number | null | undefined,
  status: ReadingActivityStatusType,
  dateStarted: z.infer<typeof optionalDatetimeSchema> | undefined,
  dateFinished: z.infer<typeof optionalDatetimeSchema> | undefined,
  graphs: z.infer<typeof storyGraphSchema> | null | undefined,
  comment: string | null | undefined
) {
  // either create new optional datetimes or link to the provided ones db entries

  let createdDateStartedId;
  if (dateStarted) {
    createdDateStartedId = (
      await prisma.optionalDatetime.create({
        data: dateStarted,
      })
    ).id;
  }

  let createdDateFinishedId;
  if (dateFinished) {
    createdDateFinishedId = (
      await prisma.optionalDatetime.create({
        data: dateFinished,
      })
    ).id;
  }

  const statusId = await getOrCreateReadingActivityStatus(accountId, status);
  const readingActivity = await prisma.readingActivity.create({
    data: {
      accountId,
      bookId,
      readingActivityStatusId: statusId,
      dateStartedId: createdDateStartedId,
      dateFinishedId: createdDateFinishedId,
      rating:
        stars !== undefined
          ? {
              create: {
                stars: stars,
                comment: comment,
              },
            }
          : undefined,
    },
  });

  if (!readingActivity) {
    return undefined;
  }

  // todo: extend for multiple
  if (graphs != null) {
    if (
      Array.isArray(graphs.data) &&
      graphs.data.some((value) => value != null)
    ) {
      // at least one value is present, so create the graph
      await prisma.graph.create({
        data: {
          data: JSON.stringify(graphs.data),
          labels: JSON.stringify(graphs.labels),
          details: JSON.stringify(graphs.details),
          title: graphs.title,
          readingActivityId: readingActivity.id,
        },
      });
    }
  }

  return readingActivity;
}
