import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { z } from "zod";
import { prisma } from "$lib/server/prisma";
import { getBookApiData } from "../../../book/api/api.server";
import { extractBookApiData, extractCategories } from "$lib/server/db/utils";
import { DEFAULT_LISTS } from "$appTypes";
import { optionalDatetimeSchema } from "../../../../schemas";
import { checkBookAuth } from "../../../../auth";
import { nullToUndefined } from "$lib/utils";

const createSchema = z.object({
  name: z.string().trim().min(1),
  author: z.string().trim().min(1),
  rating: z.number().optional(),
  wordsPerPage: z.number().optional(),
  listName: z.enum(DEFAULT_LISTS),
  volumeId: z.string().trim().optional(),
  dateStarted: optionalDatetimeSchema.optional(),
  dateFinished: optionalDatetimeSchema.optional(),
});

export async function POST(req: RequestEvent) {
  const accountId = await checkBookAuth(req.locals, req.params);

  const json_data = await req.request.json();

  const result = createSchema.safeParse(json_data);
  console.log(result);
  console.log(result.error);
  // TODO: return schema parsing errors

  if (result.success) {
    const { name, author, rating, wordsPerPage, listName, volumeId } =
      result.data;

    // null can be seen as delete, while undefined as ignore. I dont want to delete while creating
    const dateStarted = nullToUndefined(result.data.dateStarted);
    const dateFinished = nullToUndefined(result.data.dateFinished);

    /* const book_exist = await prisma.book.findFirst({ where: { name } });
    // todo: only show warning with are you sure or something.
    if (book_exist) {
      return json({
        success: false,
        message: "Books titles have to be unique.\nPlease use another title",
      });
    } */

    const bookList = await prisma.bookList.upsert({
      where: { name_accountId: { accountId, name: listName } },
      update: {}, // No update needed if it exists
      create: {
        name: listName,
        accountId,
      },
    });

    let dateStartedId;
    if (dateStarted) {
      dateStartedId = (
        await prisma.optionalDatetime.create({
          data: dateStarted,
        })
      ).id;
    }

    let dateFinishedId;
    if (dateFinished) {
      dateFinishedId = (
        await prisma.optionalDatetime.create({
          data: dateFinished,
        })
      ).id;
    }

    const optionalRating =
      rating != null
        ? {
            create: {
              stars: rating,
              comment: undefined,
            },
          }
        : undefined;

    const book = await prisma.book.create({
      data: {
        accountId,
        name,
        author,
        wordsPerPage,
        bookListId: bookList.id,
        rating: optionalRating,
        dateStartedId: dateStartedId,
        dateFinishedId: dateFinishedId,
      },
    });

    await addApiData(volumeId, book.id);

    return json({ success: true });
  }
  error(400);
}
async function addApiData(volumeId: string | undefined, bookId: string) {
  if (volumeId !== undefined) {
    const apiData = await getBookApiData(volumeId);
    console.log(apiData);

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

    console.log(categories);

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

      console.log(category);
    }
  }
}
