import type { READING_STATUS } from "$appTypes";
import type z from "zod";
import type {
  optionalDatetimeSchema,
  storyGraphSchema,
} from "../../../schemas";

import { prisma } from "$lib/server/prisma";

export async function createReadingActivity(
  accountId: string,
  bookId: string,
  stars: number | null | undefined,
  status: READING_STATUS,
  dateStarted: z.infer<typeof optionalDatetimeSchema> | undefined,
  dateFinished: z.infer<typeof optionalDatetimeSchema> | undefined,
  graphs: z.infer<typeof storyGraphSchema> | null | undefined,
  comment: string | null | undefined
) {
  let createdDateStarted;
  if (dateStarted) {
    createdDateStarted = await prisma.optionalDatetime.create({
      data: dateStarted,
    });
  }

  let createdDateFinished;
  if (dateFinished) {
    createdDateFinished = await prisma.optionalDatetime.create({
      data: dateFinished,
    });
  }

  const statusId = (
    await prisma.readingActivityStatus.findUniqueOrThrow({
      where: {
        status_accountId: {
          status,
          accountId,
        },
      },
    })
  ).id;

  const readingActivity = await prisma.readingActivity.create({
    data: {
      accountId,
      bookId,
      readingActivityStatusId: statusId,
      dateStartedId: createdDateStarted?.id,
      dateFinishedId: createdDateFinished?.id,
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
