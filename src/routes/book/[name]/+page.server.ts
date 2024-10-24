import {
  extractBookApiData,
  extractCategories,
  getBookLists,
} from "$lib/server/db/utils";
import { prisma } from "$lib/server/prisma";
import { error, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { z } from "zod";
import { getBookApiData } from "../api/api.server";
import type { queriedBookFull } from "$appTypes";

export async function load(page: ServerLoadEvent) {
  const params = page.params;

  const edit = page.url.searchParams.get("edit");

  const book = await prisma.book.findFirst({
    where: {
      name: params.name,
    },
    include: {
      rating: true,
      bookSeries: {
        include: {
          books: {
            include: {
              rating: true,
            },
          },
        },
      },
      bookApiData: {
        include: {
          categories: true,
        },
      },
    },
  });

  const bookLists = await getBookLists();

  if (!book) {
    throw error(404, { message: "Not found" });
  }

  const books = await prisma.book.findMany({
    include: {
      rating: true,
    },
  });

  return {
    book,
    books,
    bookLists,
    edit,
  };
}

const saveSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  author: z.string().trim().min(1),
  comment: z.string().trim().optional(),
  stars: z.coerce.number().min(0).max(5),
  month: z.coerce.number().min(0).max(12).optional(),
  year: z.coerce.number().min(0).max(5000).optional(),
  listName: z.string(),
  bookSeries: z.string().array(),
  bookSeriesId: z.preprocess(
    (s) => (s != "" ? Number(s) : undefined),
    z.number().optional()
  ),
  apiVolumeId: z.string().optional(),
  wordsPerPage: z.coerce.number().nonnegative().optional(),
});

function undefinedToNull<Type>(any: Type | undefined): Type | null {
  return any === undefined ? null : any;
}

function parseFormArray(
  formData: { [k: string]: FormDataEntryValue },
  attribute: string
) {
  const values = [];
  for (const [key, value] of Object.entries(formData)) {
    if (key.includes(attribute) && key.includes("[") && key.includes("]")) {
      values.push(value);
    }
  }

  return values;
}
//TODO: check if a book in the new books is already part of a bookseries, then add to it
async function updateBookSeries(
  id: string,
  bookSeries: string[],
  bookSeriesId: number | undefined
) {
  if (bookSeriesId === undefined && bookSeries.length == 0) {
    return;
  }

  type UniqueInput = "name" | "id";

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const bookSeriesNames: { [key in UniqueInput]: string }[] = bookSeries.map(
    (n) => Object.fromEntries([["name", n]])
  );

  if (bookSeriesId === undefined) {
    await prisma.bookSeries.create({
      data: {
        books: {
          connect: [...bookSeriesNames, { id }],
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
      throw error(400);
    }

    const currentBookSeriesNamesArray = currentBookSeries.books.map(
      (b) => b.name
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // const currentBookSeriesNames: { [key in UniqueInput]: string }[] =
    //   currentBookSeriesNamesArray.map((n) => Object.fromEntries([["name", n]]));

    // console.log("current");
    // console.log(currentBookSeriesNames);

    // console.log(bookSeriesNames);
    // console.log(bookSeriesNames);

    const oldSeries = currentBookSeriesNamesArray.filter(
      (bookName) => !bookSeries.includes(bookName)
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const oldSeriesNames: { [key in UniqueInput]: string }[] = oldSeries.map(
      (n) => Object.fromEntries([["name", n]])
    );

    // console.log("DISconnecting: ");
    // console.log(oldSeriesNames);

    await prisma.bookSeries.update({
      where: { id: bookSeriesId },
      data: {
        books: {
          connect: bookSeriesNames,
          disconnect: oldSeriesNames,
        },
      },
    });
  }
}

export const actions = {
  save: async (event: RequestEvent) => {
    const session = await event.locals.getSession();
    if (!session) {
      throw error(401);
    }

    const formData = Object.fromEntries(await event.request.formData());
    console.log(formData);
    if (formData.year == "") {
      delete formData.year;
    }
    // console.log(formData);
    const bookSeries = parseFormArray(formData, "books");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    formData["bookSeries"] = bookSeries;

    const result = saveSchema.safeParse(formData);
    console.log(result);

    if (result.success) {
      const {
        id,
        name,
        author,
        comment,
        stars,
        month,
        year,
        listName,
        bookSeries,
        bookSeriesId,
        apiVolumeId,
        wordsPerPage,
      } = result.data;

      // don't update if only the book itself is in the series
      if (!(bookSeries.length == 1 && bookSeries[0] == name)) {
        await updateBookSeries(id, bookSeries, bookSeriesId);
      }

      const allBooks = await prisma.book.findMany();
      if (allBooks.find((b) => b.name == name && b.id != id) !== undefined) {
        return {
          data: formData,
          errors: {
            name: ["Book names have to be unique"],
          },
        };
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
        where: { id },
        data: {
          name,
          author,
          monthRead: undefinedToNull(month),
          yearRead: undefinedToNull(year),
          rating: {
            upsert: {
              update: { stars: stars, comment },
              create: { stars: stars, comment },
            },
          },
          bookList: {
            connect: {
              name: listName,
            },
          },
          bookApiData:
            apiData?.id !== undefined ? { connect: { id: apiData.id } } : {},
          wordsPerPage,
        },
      });

      console.log("nnew book:", book);

      throw redirect(302, "/book/" + encodeURIComponent(book.name));
    }

    const { fieldErrors: errors } = result.error.flatten();
    console.log(errors);

    return {
      data: formData,
      errors,
    };
  },
};
