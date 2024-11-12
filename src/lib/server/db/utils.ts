import type { queriedBookFull } from "$appTypes";
import { prisma } from "$lib/server/prisma";
import { sortBooksDefault } from "$lib/utils";
import type { Book } from "@prisma/client";

export async function getBookLists() {
  return prisma.bookList.findMany();
}

// Define the input types using a discriminated union to ensure only one identifier is provided
type GetAccountById = {
  accountId: string;
  accountUsername?: never;
};

type GetAccountByUsername = {
  accountUsername: string;
  accountId?: never;
};

type GetAccountParams = GetAccountById | GetAccountByUsername;

export async function loadBooks(accountId: string | undefined, username: string | undefined, listName = "Read") {
  const data = {
    books: await prisma.book.findMany({
      where: {
        account: {
          username: ""
        },
        bookListName: listName,
      },
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
    }),
  };

  data.books = data.books.sort(sortBooksDefault);

  return data;
}

export function extractCategories(apiData: queriedBookFull): string[] {
  const categories = [];
  for (const entry of apiData.volumeInfo.categories ?? []) {
    // entry can be: "Fiction / Science Fiction / General", which is a bit stupid, so we have to split it
    // entry can also be just "Fiction", don't ask me, ask google

    if (entry.includes("/")) {
      for (const category of entry.split("/")) {
        categories.push(category.trim());
      }
    } else {
      categories.push(entry);
    }
  }

  return categories;
}

export function extractBookApiData(apiData: queriedBookFull) {
  const info = apiData.volumeInfo;
  const { title, subtitle, publishedDate, publisher, pageCount, language } =
    info;
  const authors = info.authors.join("|"); //TODO: relation
  const thumbnailUrl = info.imageLinks?.thumbnail;
  const isbn_13 = info.industryIdentifiers?.find(
    (o) => o.type == "ISBN_13"
  )?.identifier;

  return {
    id: apiData.id,
    title,
    subtitle,
    authors,
    publishedDate,
    publisher,
    pageCount,
    language,
    thumbnailUrl,
    isbn_13,
  };
}
