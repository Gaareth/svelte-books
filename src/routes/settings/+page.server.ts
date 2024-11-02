import {
  type RequestHandler,
  error,
  json,
  type ServerLoadEvent,
} from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { extractBookApiData, extractCategories } from "$lib/server/db/utils.js";
import {
  getBookApiData,
  queryBooks,
  queryBooksFull,
} from "../book/api/api.server";
import type { Book, BookApiData } from "@prisma/client";
import type { queriedBookFull } from "$appTypes";
import { arrMax, delay, getErrorMessage, zip } from "$lib/utils";
import { SSE_EVENT } from "../book/api/update_all/sse";

type bookDiff = {
  bookName: string;
  propName: string;
  oldValue: unknown;
  newValue: unknown;
};
/// Updates existing apiData by querying google
async function updateData() {
  const existingCategoryNames = (await prisma.bookCategory.findMany()).map(
    ({ name }) => name
  );

  const diffs: bookDiff[] = [];
  let booksUpdated = 0;

  const bookDataList = await prisma.bookApiData.findMany();
  SSE_EVENT.max = bookDataList.length;

  for (const book of bookDataList) {
    const { id, title } = book;
    SSE_EVENT.msg = "Updating: " + title;
    SSE_EVENT.items = SSE_EVENT.items + 1;
    const apiData = await getBookApiData(id);
    const extractedData = extractBookApiData(apiData);
    const categories = extractCategories(apiData);

    // create non-existing categories
    for (const category_name of categories) {
      // console.log(existingCategoryNames.includes(category_name));
      // console.log(category_name);

      if (!existingCategoryNames.includes(category_name)) {
        await prisma.bookCategory.create({
          data: {
            name: category_name,
          },
        });
      }
    }

    // update stored api data with newly fetched data
    await prisma.bookApiData.update({
      where: {
        id,
      },

      data: {
        ...extractedData,
        categories: {
          set: categories.map((n) => ({ name: n })),
        },
      },
    });

    // TOOD: zipMap?
    zip(Object.keys(extractedData).sort(), Object.keys(book).sort()).forEach(
      (props) => {
        console.log(props);

        const entries = [
          //TODO: give hints
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          [props[0], extractedData[props[0]]],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          [props[1], extractedData[props[1]]],
        ];
        console.log(entries);

        const oldKV = entries[0];

        const newKV = entries[1];
        if (oldKV[1] != newKV[1]) {
          return diffs.push({
            bookName: title,
            propName: oldKV[0],
            oldValue: oldKV[1],
            newValue: newKV[1],
          });
        }
      }
    );
    // diffs.push({
    //   bookName: title,
    //   propName: "a",
    //   oldValue: 1,
    //   newValue: 2,
    // });
    // await delay(100);
    booksUpdated += 1;
  }

  return { booksUpdated, diffs };
}

type errorBooksType = {
  book: Book;
  error: string;
  volumeId: string | undefined;
}[];
async function createConnections(connect_all: boolean) {
  const scoreMap: Record<string, number> = {
    publishedDate: 1,
    publisher: 1,
    industryIdentifiers: 1,
    imageLinks: 2,
    pageCount: 2,
    printedPageCount: 1,
    categories: 3,
  };
  const unconnectedBooks = await prisma.book.findMany({
    where: {
      bookApiDataId: connect_all ? undefined : null, // for whatever reason, undefined applies to all entries (kinda make sense lol)
      bookListName: "Read",
    },
  });
  console.log(unconnectedBooks.length);
  SSE_EVENT.max = unconnectedBooks.length;

  const createConnection = async (
    volumeId: string,
    bookName: string
  ): Promise<BookApiData> => {
    const dataExists = await prisma.bookApiData.findUnique({
      where: {
        id: volumeId,
      },
    });
    if (dataExists !== null) {
      // no need to update the data, as we already did in `updateData`
      return prisma.bookApiData.update({
        where: {
          id: volumeId,
        },
        data: {
          book: {
            connect: {
              name: bookName,
            },
          },
        },
      });
    } else {
      const apiData = await getBookApiData(volumeId); //TODO
      const extractedData = extractBookApiData(apiData);
      const categories = extractCategories(apiData);
      return prisma.bookApiData.create({
        data: {
          ...extractedData,
          book: {
            connect: {
              name: bookName,
            },
          },
          categories: {
            connectOrCreate: categories.map((c) => ({
              where: { name: c },
              create: { name: c },
            })),
          },
        },
      });
    }
  };

  const findVolumeId = async (
    book: Book
  ): Promise<{ volumeId: string; score: number } | undefined> => {
    return queryBooksFull(`${book.name}+inauthor:${book.author}`)
      .then((books: queriedBookFull[]) => {
        console.log(books);
        console.log(books.length);

        if (books.length == 0 || books === undefined) {
          return undefined;
        }
        // console.log(books);

        const scores = books.map((b: queriedBookFull) =>
          Object.keys(b.volumeInfo)
            .filter((e) => e !== undefined && scoreMap[e] !== undefined)
            .reduce((acc, key) => acc + scoreMap[key], 0)
        );
        // works for arrays with few elements. Scores should only contains < 40 elements? (see google books api max results)
        const max = arrMax(scores);
        console.log(max);

        if (max === undefined || max?.maxValue == 0) {
          return undefined;
        }

        return { volumeId: books[max.maxIndex].id, score: max.maxValue };
      })
      .catch((error: string) => {
        console.log("Error querying google api: " + error);

        return undefined;
      });
  };

  const updatedBookNames = [];
  const errorsBooks: errorBooksType = [];

  for (const book of unconnectedBooks) {
    // console.log("book: " + book.name);
    SSE_EVENT.msg = "Adding: " + book.name;
    SSE_EVENT.items = SSE_EVENT.items + 1;

    // try {
    //   throw Error("oh no");
    // } catch (e) {
    //   errorsBooks.push({ book, error: getErrorMessage(e), volumeId: "4" });
    // }

    // const res = await findVolumeId(book);
    // console.log(res);

    // if (res === undefined) {
    //   errorsBooks.push({
    //     book,
    //     error: "No volumeID found",
    //     volumeId: undefined,
    //   });
    // } else {
    //   const { volumeId, score } = res;
    //   console.log("Book: " + book.name + ", Score: " + score);

    //   try {
    //     createConnection(volumeId, book.name);
    //     booksUpdated += 1;
    //   } catch (e) {
    //     errorsBooks.push({ book, error: getErrorMessage(e), volumeId });
    //     console.log(e);
    //   }
    // }

    updatedBookNames.push(book.name);
    await delay(200);
    // break;
  }

  return { updatedBookNames, errorsBooks };
}

export type settingsApiResult<T> = {
  success: boolean;
  booksUpdated: number;
  items: T;
};

export type settingsApiCreateResult = {
  success: boolean;
  updatedBookNames: string[];
  errorsBooks: errorBooksType;
};

export type settingsApiReloadResult = {
  success: boolean;
  booksUpdated: number;
  diffs: bookDiff[];
};

export const actions = {
  reload: async ({ locals }) => {
    const session = await locals.getSession();
    if (!session) {
      throw error(401);
    }

    SSE_EVENT.items = 0;
    SSE_EVENT.msg = "";
    SSE_EVENT.max = 0;

    const diffs = await updateData();
    // console.log(SSE_EVENT);

    const response: settingsApiReloadResult = {
      success: true,
      ...diffs,
    };

    SSE_EVENT.msg = "done";
    return response;
  },

  try_add: async ({ locals, request }) => {
    const session = await locals.getSession();
    if (!session) {
      throw error(401);
    }
    const formData = await request.formData();
    const connect_all = formData.get("connect-all") == "on";

    SSE_EVENT.items = 0;
    SSE_EVENT.msg = "";
    SSE_EVENT.max = 0;

    const result = await createConnections(connect_all);
    const response: settingsApiCreateResult = {
      success: result.errorsBooks.length == 0 ? true : false,
      ...result,
    };

    // console.log(response);
    // console.log(JSON.stringify(response));
    SSE_EVENT.msg = "done";
    return response;
  },
};

// export async function POST({ request, locals }) {
//   const session = await locals.getSession();
//   if (!session) {
//     throw error(401);
//   }

//   // await updateData();
//   const result = await createConnections();

//   return json({
//     success: result.errorsBooks.length == 0 ? true : false,
//     ...result,
//   });

//   // return json({success: false})
// }

export async function load({ locals }: ServerLoadEvent) {
  const session = await locals.getSession();
  if (!session) {
    throw error(401);
  }
}
