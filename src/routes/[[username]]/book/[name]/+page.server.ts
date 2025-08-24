import { error, fail, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import { z } from "zod";

import { authorize } from "../../../../auth";
import { optionalNumericString } from "../../../../schemas";
import { getBookApiData } from "../../../book/api/api.server";

import type { Actions, RequestEvent } from "./$types";

import { VISIBILITY } from "$appTypes";
import {
  extractBookApiData,
  extractCategories,
  loadBooks,
} from "$lib/server/db/utils";
import { prisma } from "$lib/server/prisma";

export async function load(page: ServerLoadEvent) {
  const params = page.params;
  const session = await page.locals.auth();
  console.log("Session:", session);
  const { sessionAccount, requestedAccount } = await authorize(
    session,
    params.username,
    (requestedAccount) => requestedAccount?.isPublic
  );

  const isAuthorizedToModify =
    (sessionAccount?.id === requestedAccount.id || sessionAccount?.isAdmin) ??
    false;

  const edit = page.url.searchParams.get("edit");

  const book = await prisma.book.findFirst({
    where: {
      name: params.name,
      accountId: requestedAccount?.id,
    },
    include: {
      bookList: true,
      bookSeries: {
        include: {
          books: {
            include: {
              bookApiData: {
                include: {
                  categories: true,
                },
              },
              readingActivity: {
                where: {
                  status: {
                    visibility: isAuthorizedToModify
                      ? undefined
                      : VISIBILITY.PUBLIC,
                  },
                },
                include: {
                  dateStarted: true,
                  dateFinished: true,
                  rating: true,
                  storyGraphs: true,
                  book: true,
                },
              },
            },
          },
        },
      },
      bookApiData: {
        include: {
          categories: true,
        },
      },
      readingActivity: {
        where: {
          status: {
            visibility: isAuthorizedToModify ? undefined : VISIBILITY.PUBLIC,
          },
        },
        include: {
          dateStarted: true,
          dateFinished: true,
          rating: true,
          storyGraphs: true,
          book: true,
          status: true,
        },
      },
    },
  });

  const bookLists = await prisma.bookList.findMany({
    where: {
      accountId: requestedAccount.id,
    },
  });

  if (!book) {
    error(404, { message: "Not found" });
  }

  const books = await loadBooks({ accountId: requestedAccount.id }, undefined);

  return {
    book,
    books,
    bookLists,
    edit,
    headerConfig: {
      transparent: true,
      wrapperClass: "lg:max-w-6xl",
    },
    isAuthorizedToModify,
  };
}

//TODO: reuse
const saveSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  author: z.string().trim().min(1),
  listName: z.string().optional(),
  bookSeries: z.string().array(),
  bookSeriesId: z
    .preprocess((s) => (s != "" ? Number(s) : undefined), z.number().optional())
    .optional(),
  apiVolumeId: z.string().optional(),
  wordsPerPage: optionalNumericString(
    z.coerce.number().nonnegative().optional()
  ).optional(),

  description: z.string().trim().optional(),
  coverImage: z.string().trim().nullish(),
});

//TODO: check if a book in the new books is already part of a bookseries, then add to it
async function updateBookSeries(
  bookId: string,
  accountId: string,
  bookSeries: string[],
  bookSeriesId: number | undefined
) {
  if (bookSeriesId === undefined && bookSeries.length == 0) {
    return;
  }

  type UniqueInput = "id";

  // removes books in the provided bookSeries[] that do not belong to the specified user
  const filterOwnBooks = async (bId: string) => {
    const book = await prisma.book.findUnique({
      where: {
        id: bId,
      },
    });
    return book?.accountId == accountId;
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const bookSeriesIds: { [key in UniqueInput]: string }[] = bookSeries
    .filter(filterOwnBooks)
    .map((n) => Object.fromEntries([["id", n]]));

  if (bookSeriesId === undefined) {
    await prisma.bookSeries.create({
      data: {
        books: {
          connect: [...bookSeriesIds, { id: bookId }],
        },
      },
    });
  } else {
    const currentBookSeries = await prisma.bookSeries.findUnique({
      where: {
        id: bookSeriesId,
      },
      select: {
        books: true,
      },
    });

    if (currentBookSeries === null) {
      error(400);
    }

    const currentBookSeriesIdsArray = currentBookSeries.books.map((b) => b.id);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // const currentBookSeriesNames: { [key in UniqueInput]: string }[] =
    //   currentBookSeriesNamesArray.map((n) => Object.fromEntries([["name", n]]));

    // console.log("current");
    // console.log(currentBookSeriesNames);

    // console.log(bookSeriesNames);
    // console.log(bookSeriesNames);

    const oldSeries = currentBookSeriesIdsArray.filter(
      (bId) => !bookSeries.includes(bId)
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const oldSeriesIds: { [key in UniqueInput]: string }[] = oldSeries.map(
      (n) => Object.fromEntries([["id", n]])
    );

    // console.log("DISconnecting: ");
    // console.log(oldSeriesIds);

    await prisma.bookSeries.update({
      where: { id: bookSeriesId },
      data: {
        books: {
          connect: bookSeriesIds,
          disconnect: oldSeriesIds,
        },
      },
    });
  }
}

export const actions = {
  save: async (event: RequestEvent) => {
    const accountId = (
      await authorize(await event.locals.auth(), event.params.username)
    ).requestedAccount.id;

    const f = await event.request.formData();
    console.log(f);

    const formData = Object.fromEntries(f);
    // console.log("1", formData);

    const bookSeries = f.getAll("books[]");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    formData["bookSeries"] = bookSeries;

    const result = saveSchema.safeParse(formData);

    if (result.success) {
      // return;
      const {
        id,
        name,
        author,
        description,
        listName,
        bookSeries,
        bookSeriesId,
        apiVolumeId,
        wordsPerPage,
        coverImage,
      } = result.data;

      // don't update if only the book itself is in the series
      if (!(bookSeries.length == 1 && bookSeries[0] == name)) {
        await updateBookSeries(id, accountId, bookSeries, bookSeriesId);
      }

      const allBooks = await prisma.book.findMany();
      if (allBooks.find((b) => b.name == name && b.id != id) !== undefined) {
        return fail(400, {
          data: formData,
          errors: {
            name: ["Book names have to be unique"],
          },
        });
      }

      let apiData;
      // if apiVolumeId was sent with
      // refetch the data from google and update (or create) it locally
      if (apiVolumeId !== undefined) {
        apiData = await getBookApiData(apiVolumeId);
        const extractedData = extractBookApiData(apiData);
        console.log(extractedData);

        const categories = extractCategories(apiData);

        console.log(categories);

        for (const category_str of categories) {
          try {
            const category = await prisma.bookCategory.create({
              data: {
                name: category_str,
              },
            });
            console.log(category);
          } catch (e) {
            // ignore
          }
        }

        // categories.map((n) => ({ name: n }));
        await prisma.bookApiData.upsert({
          where: { id: apiData.id },
          create: {
            ...extractedData,
            categories: {
              connect: categories.map((n) => ({
                name: n,
              })),
            },
          },
          update: {
            ...extractedData,
            categories: {
              set: categories.map((n) => ({ name: n })),
            },
          },
        });
      }

      const book = await prisma.book.update({
        where: { id, accountId },
        data: {
          name,
          author,
          description,
          bookApiData:
            apiData?.id !== undefined ? { connect: { id: apiData.id } } : {},
          wordsPerPage,
          coverImage: coverImage,
        },
      });

      console.log("nnew book:", book);

      redirect(302, "/book/" + encodeURIComponent(book.name));
    }

    const { fieldErrors: errors } = result.error.flatten();
    console.log("Errors:", errors);
    console.log("Issues:", result.error.issues);

    return fail(400, {
      data: formData,
      errors,
    });
  },
} satisfies Actions;
