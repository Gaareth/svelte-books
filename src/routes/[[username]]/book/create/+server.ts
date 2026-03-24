import { error, json } from "@sveltejs/kit";
import { z } from "zod";

import { authorize } from "$lib/auth/auth";
import {
  createOwnershipSchema,
  optionalDatetimeSchema,
} from "$lib/schemas/schemas";
import {
  createReadingActivity,
  getOrCreateReadingActivityStatus,
} from "../../../api/reading-activity/api.server";
import { getBookApiData } from "../../../book/api/api.server";

import type { RequestEvent } from "./$types";

import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
import { extractBookApiData, extractCategories } from "$lib/server/db/utils";
import { prisma } from "$lib/server/prisma";
import {
  dateToOptional,
  nullToUndefined,
  optionalToDate,
} from "$lib/utils/utils";
import { BookOwnership } from "$prismaBrowser";

let createSchema = z
  .object({
    name: z.string().trim().min(1),
    author: z.string().trim().min(1),
    stars: z.coerce.number().optional(),
    wordsPerPage: z.number().optional().nullish(),
    readingStatus: z.nativeEnum(READING_ACTIVITY_TYPES),
    volumeId: z.string().trim().optional(),
    dateStarted: optionalDatetimeSchema.optional(),
    dateFinished: optionalDatetimeSchema.optional(),
  })
  .merge(createOwnershipSchema);

export async function POST(req: RequestEvent) {
  const accountId = (
    await authorize(await req.locals.auth(), req.params.username)
  ).requestedAccount.id;

  const json_data = await req.request.json();

  const result = createSchema.safeParse(json_data);
  // console.log(result);
  // console.log(result.error);
  // TODO: return schema parsing errors

  if (result.success) {
    const {
      name,
      author,
      stars,
      wordsPerPage,
      readingStatus,
      volumeId,
      acquiredAtDate,
      bookOwnership,
      location,
    } = result.data;

    // null can be seen as delete, while undefined as ignore. I dont want to delete while creating
    // if its acquired, let the start date be the acquired date
    const dateStarted = nullToUndefined(
      readingStatus === READING_ACTIVITY_TYPES.ACQUIRED
        ? acquiredAtDate
        : result.data.dateStarted
    );
    const dateFinished = nullToUndefined(result.data.dateFinished);

    let book = await prisma.book.findFirst({ where: { name } });
    const book_exist = book != null;

    if (
      bookOwnership == null &&
      readingStatus === READING_ACTIVITY_TYPES.ACQUIRED
    ) {
      error(400, {
        message:
          "Ownership status is required when reading status is 'acquired'",
      });
    }

    if (book == null) {
      book = await prisma.book.create({
        data: {
          accountId,
          name,
          author,
          wordsPerPage,
          // bookListId: bookList.id,
        },
      });
      await addApiData(volumeId, book.id);
    }

    if (bookOwnership != null && location != null && acquiredAtDate != null) {
      // if not status is acquired, create an extra reading activity
      const createReadingActivity =
        readingStatus !== READING_ACTIVITY_TYPES.ACQUIRED;
      const ownership = await createOwnership(
        accountId,
        book.id,
        {
          location,
          status: bookOwnership,
          aquiredAt: nullToUndefined(optionalToDate(acquiredAtDate)),
        },
        createReadingActivity
      );

      if (!ownership) {
        error(500, {
          message: "Failed to create book ownership",
        });
      }
    }

    const rA = await createReadingActivity(
      accountId,
      book.id,
      stars,
      readingStatus,
      dateStarted,
      dateFinished,
      null,
      null
    );

    if (!rA) {
      error(500, {
        message: "Failed to create reading activity",
      });
    }

    return json({
      success: true,
      message: book_exist ? "Added reading activity" : "Created book",
    });
  }

  console.log("Error parsing form data for creating a new book:", result.error);
  error(400, {
    message: "Invalid form data",
  });
}

async function createOwnership(
  accountId: string,
  bookId: string,
  {
    location,
    status,
    aquiredAt,
  }: { location?: string; status?: BookOwnership; aquiredAt?: Date },
  createReadingActivity = true
) {
  const dateAcquiredId = aquiredAt
    ? (
        await prisma.optionalDatetime.create({
          data: dateToOptional(aquiredAt),
        })
      ).id
    : undefined;

  const ownership = await prisma.ownership.create({
    data: {
      bookId,
      location,
      status,
      acquiredAtId: dateAcquiredId,
    },
  });

  let readingActivity;
  if (createReadingActivity) {
    const readingActivity = await prisma.readingActivity.create({
      data: {
        bookId,
        accountId,
        readingActivityStatusId: await getOrCreateReadingActivityStatus(
          accountId,
          READING_ACTIVITY_TYPES.ACQUIRED
        ),
        dateStartedId: dateAcquiredId,
      },
    });
  }

  return { ownership, readingActivity };
}

/// Adds API data to the book if volumeId is provided
async function addApiData(volumeId: string | undefined, bookId: string) {
  if (volumeId !== undefined) {
    const apiData = await getBookApiData(volumeId);
    // console.log(apiData);

    const extractedData = extractBookApiData(apiData);

    const bookApiData = await prisma.bookApiData.findUnique({
      where: { id: apiData.id },
    });

    if (bookApiData !== null) {
      await prisma.bookApiData.update({
        where: { id: apiData.id },
        data: extractedData,
      });
      // message = `Updated api data (${apiData.id}) from ${bookApiData?.title} to ${name}`;
    }

    await prisma.book.update({
      where: { id: bookId },
      data: {
        bookApiData: {
          connectOrCreate: {
            where: { id: apiData.id },
            create: extractedData,
          },
        },
      },
    });

    const categories = extractCategories(apiData);

    // console.log(categories);

    for (const category_str of categories) {
      const category = await prisma.bookCategory.upsert({
        where: { name: category_str },
        update: {
          name: category_str,
          books: { connect: { id: apiData.id } },
        },
        create: {
          name: category_str,
          books: { connect: { id: apiData.id } },
        },
      });

      // console.log(category);
    }
  }
}
