import {
  extractBookApiData,
  extractCategories,
  loadBooks,
} from "$lib/server/db/utils";
import { prisma } from "$lib/server/prisma";
import { error, fail, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { z, ZodIssueCode } from "zod";
import { getBookApiData } from "../../../book/api/api.server";
import { type queriedBookFull } from "$appTypes";
import {
  optionalDatetimeSchema,
  parseFormArray,
  parseFormObject,
} from "../../../../schemas";
import { checkBookAuth } from "../../../../auth";
import type { Actions } from "./$types";
import { parseFormData } from "parse-nested-form-data";

export async function load(page: ServerLoadEvent) {
  const params = page.params;
  const accountId = await checkBookAuth(page.locals, params);

  const edit = page.url.searchParams.get("edit");

  const book = await prisma.book.findFirst({
    where: {
      name: params.name,
      accountId,
    },
    include: {
      rating: true,
      dateStarted: true,
      dateFinished: true,
      bookList: true,
      bookSeries: {
        include: {
          books: {
            include: {
              rating: true,
              dateStarted: true,
              dateFinished: true,
              bookApiData: {
                include: {
                  categories: true,
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
      storyGraphs: true,
    },
  });

  const bookLists = await prisma.bookList.findMany({
    where: {
      accountId,
    },
  });

  if (!book) {
    error(404, { message: "Not found" });
  }

  const books = (await loadBooks({ accountId }, "Read")).books;

  return {
    book,
    books,
    bookLists,
    edit,
  };
}

const parseJsonPreprocessor = (value: any, ctx: z.RefinementCtx) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: (e as Error).message,
      });
    }
  }

  return value;
};

const storyGraphSchema = z.object({
  title: z.string(),
  labels: z.preprocess(parseJsonPreprocessor, z.string().array()),
  details: z.preprocess(parseJsonPreprocessor, z.string().array()),
  data: z.preprocess(parseJsonPreprocessor, z.number().nullable().array()),
});

//TODO: reuse
const saveSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  author: z.string().trim().min(1),
  comment: z.string().trim().optional(),
  stars: z.coerce.number().min(0).max(5).optional(),
  listName: z.string(),
  bookSeries: z.string().array(),
  bookSeriesId: z
    .preprocess((s) => (s != "" ? Number(s) : undefined), z.number().optional())
    .optional(),
  apiVolumeId: z.string().optional(),
  wordsPerPage: z.coerce.number().nonnegative().optional(),
  dateStarted: optionalDatetimeSchema.nullish(),
  dateFinished: optionalDatetimeSchema.nullish(),
  graphs: storyGraphSchema.optional(),
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
    const accountId = await checkBookAuth(event.locals, event.params);

    const f = await event.request.formData();
    console.log(f);

    const formData = Object.fromEntries(f);
    // console.log("1", formData);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    formData["dateStarted"] = parseFormObject(formData, "dateStarted");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    formData["dateFinished"] = parseFormObject(formData, "dateFinished");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    formData["graphs"] = parseFormObject(formData, "graphs");

    if (formData.year == "") {
      delete formData.year;
    }

    const bookSeries = f.getAll("books[]");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    formData["bookSeries"] = bookSeries;
    // console.log(formData);

    const result = saveSchema.safeParse(formData);

    if (result.success) {
      // return;
      const {
        id,
        name,
        author,
        comment,
        stars,

        listName,
        bookSeries,
        bookSeriesId,
        apiVolumeId,
        wordsPerPage,
        dateStarted,
        dateFinished,
        graphs,
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

      // only delete if exist
      if (dateFinished == null || dateStarted == null) {
        const currentBook = await prisma.book.findUnique({ where: { id } });
        console.log("cb", currentBook);

        if (currentBook?.dateStartedId != null && dateStarted == null) {
          await prisma.book.update({
            where: { id },
            data: {
              dateStarted: { delete: true },
            },
          });
        }

        if (currentBook?.dateFinishedId != null && dateFinished == null) {
          await prisma.book.update({
            where: { id },
            data: {
              dateFinished: { delete: true },
            },
          });
        }
      }

      const book = await prisma.book.update({
        where: { id },
        data: {
          name,
          author,
          dateStarted: dateStarted
            ? {
                upsert: {
                  update: dateStarted,
                  create: dateStarted,
                },
              }
            : undefined,
          dateFinished: dateFinished
            ? {
                upsert: {
                  update: dateFinished,
                  create: dateFinished,
                },
              }
            : undefined,
          rating:
            stars !== undefined
              ? {
                  upsert: {
                    update: { stars: stars, comment },
                    create: { stars: stars, comment },
                  },
                }
              : undefined,
          bookList: {
            connect: {
              name_accountId: {
                name: listName,
                accountId,
              },
            },
          },
          bookApiData:
            apiData?.id !== undefined ? { connect: { id: apiData.id } } : {},
          wordsPerPage,
          storyGraphs: {
            deleteMany: {}, // delete all
          },
        },
      });

      // todo: extend for multiple
      if (graphs != null) {
        const g = await prisma.graph.create({
          data: {
            data: JSON.stringify(graphs.data),
            labels: JSON.stringify(graphs.labels),
            details: JSON.stringify(graphs.details),
            title: graphs.title,
            bookId: book.id,
          },
        });
        // console.log(graphs);

        // console.log("graph", g);
      }

      console.log("nnew book:", book);

      redirect(302, "/book/" + encodeURIComponent(book.name));
    }

    const { fieldErrors: errors } = result.error.flatten();
    console.log(errors);

    return fail(400, {
      data: formData,
      errors,
    });
  },
} satisfies Actions;
