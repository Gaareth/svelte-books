import type { queriedBookFull } from "$appTypes";
import { extractBookApiData, extractCategories } from "$lib/server/db/utils";
import { zip, arrMax, getErrorMessage } from "$lib/utils";
import type { Book, BookApiData } from "@prisma/client";
import { getBookApiData, queryBooksFull } from "../book/api/api.server";
import { SSE_DATA } from "../book/api/update_all/sse";

type bookDiff = {
  bookName: string;
  propName: string;
  oldValue: unknown;
  newValue: unknown;
};

/// Updates existing apiData by querying google
export async function updateData(accountId: string) {
  const existingCategoryNames = (await prisma.bookCategory.findMany()).map(
    ({ name }) => name
  );

  const diffs: bookDiff[] = [];
  let booksUpdated = 0;

  const bookDataList = await prisma.bookApiData.findMany({
    where: {
      book: {
        some: {
          accountId,
        },
      },
    },
  });

  console.log("bookdatalist", bookDataList.length);

  SSE_DATA[accountId].max = bookDataList.length;

  for (const book of bookDataList) {
    // await delay(1000);

    const { id, title } = book;
    SSE_DATA[accountId].msg = "Updating: " + title;
    SSE_DATA[accountId].items = SSE_DATA[accountId].items + 1;
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
        // console.log(entries);

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

    booksUpdated += 1;
  }

  return { booksUpdated, diffs };
}

type errorBooksType = {
  book: Book;
  error: string;
  volumeId: string | undefined;
}[];

export async function createConnections(accountId: string, connect_all: boolean) {
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
      accountId,
    },
  });
  console.log("num books to connect", unconnectedBooks.length);
  SSE_DATA[accountId].max = unconnectedBooks.length;

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
    console.log("book: " + book.name);
    SSE_DATA[accountId].msg = "Adding: " + book.name;
    SSE_DATA[accountId].items = SSE_DATA[accountId].items + 1;

    // try {
    //   throw Error("oh no");
    // } catch (e) {
    //   errorsBooks.push({ book, error: getErrorMessage(e), volumeId: "4" });
    // }

    const res = await findVolumeId(book);
    // console.log(res);

    if (res === undefined) {
      errorsBooks.push({
        book,
        error: "No volumeID found",
        volumeId: undefined,
      });
    } else {
      const { volumeId, score } = res;
      console.log("Book: " + book.name + ", Score: " + score);

      try {
        createConnection(volumeId, book.name);
        // booksUpdated += 1;
      } catch (e) {
        errorsBooks.push({ book, error: getErrorMessage(e), volumeId });
        console.log(e);
      }
    }

    updatedBookNames.push(book.name);
    // await delay(200);
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
