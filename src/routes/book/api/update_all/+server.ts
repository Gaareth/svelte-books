import { type RequestHandler, error, json } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { extractBookApiData, extractCategories } from "$lib/server/db/utils.js";
import { getBookApiData, queryBooks, queryBooksFull } from "../api.server";
import type { Book, BookApiData } from "@prisma/client";
import type { queriedBookFull } from "$appTypes";
import { arrMax } from "$lib/utils";

/// Updates existing apiData by querying google
async function updateData() {
  const existingCategoryNames = (await prisma.bookCategory.findMany()).map(
    ({ name }) => name
  );

  // console.log(existingCategoryNames);

  const bookDataList = await prisma.bookApiData.findMany();
  for (const { id } of bookDataList) {
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
  }
}

async function createConnections() {
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
      bookApiDataId: undefined,
      bookListName: "Read",
    },
  });
  console.log(unconnectedBooks.length);

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

  const findVolumeId = async (book: Book): Promise<string | undefined> => {
    return queryBooksFull(`${book.name}+inauthor:${book.author}`)
      .then((books) => {
        console.log(books);
        console.log(books.length);
        
        
        if (books.length == 0 || books) {
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

        return books[max.maxIndex].id;
      })
      .catch((error) => {
        console.log("Error querying google api: " + error);
        
        return undefined;
      });
  };

  let booksUpdated = 0;
  const errorsBooks = [];

  for (const book of unconnectedBooks) {
    console.log("book: " + book.name);

    const volumeId = await findVolumeId(book);
    console.log(volumeId);

    if (volumeId === undefined) {
      errorsBooks.push(book);
    } else {
      createConnection(volumeId, book.name)
        .then(() => {
          booksUpdated += 1;
        })
        .catch((error) => {
          console.log(
            `Error connecting ${book.name} with ${volumeId}: ${error}`
          );
          errorsBooks.push(book);
        });
    }
  }

  return { booksUpdated, errorsBooks };
}

export async function POST({ request, locals }) {
  const session = await locals.getSession();
  if (!session) {
    throw error(401);
  }

  // await updateData();
  const result = await createConnections();

  return json({
    success: result.errorsBooks.length == 0 ? true : false,
    ...result,
  });

  // return json({success: false})
}
