import {
  type Account,
  type Prisma,
  type ReadingActivityType,
} from "$prismaClient";

import { type queriedBookFull } from "$appTypes";
import { prisma } from "$lib/server/prisma";
import { sortReadingActivity } from "$lib/utils/utils";
import type { Session } from "@auth/sveltekit";
import { whereVisibilityPublicOrAuthenticatedOrAll } from "./prismaUtils";

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

export async function loadBooks(
  accountParams: GetAccountParams,
  listName: string | undefined = undefined
) {
  const { accountId, accountUsername } = accountParams;

  const whereClause = {
    ...(accountId
      ? { accountId }
      : { account: { username: accountUsername as string } }),
  };

  const books = await prisma.book.findMany({
    where: {
      ...whereClause,
      bookList: {
        name: listName,
      },
    },
    include: {
      bookList: true,
      bookApiData: {
        include: {
          categories: true,
        },
      },
      readingActivity: {
        include: {
          dateStarted: true,
          dateFinished: true,
          rating: true,
          storyGraphs: true,
          book: true,
        },
      },
    },
  });

  return books;
}

export async function getReadingActivity(
  requestedAccountId: string,
  session: Session | Account | null,
  returnAll: boolean = false,
  status: ReadingActivityType | undefined = undefined
) {
  const readingActivity = await prisma.readingActivity.findMany({
    where: {
      accountId: requestedAccountId,
      status: {
        status: status,
        ...whereVisibilityPublicOrAuthenticatedOrAll(session, returnAll),
      },
    },
    include: {
      status: true,
      dateStarted: true,
      dateFinished: true,
      rating: true,
      account: {
        select: {
          id: true,
          username: true,
        },
      },
      book: {
        include: {
          bookList: true,
          bookApiData: {
            include: {
              categories: true,
            },
          },
        },
      },
    },
  });

  return readingActivity.sort(sortReadingActivity);
}

export function extractCategories(apiData: queriedBookFull): string[] {
  const categories = [];
  for (const entry of apiData.volumeInfo.categories ?? []) {
    // entry can be: "Fiction / Science Fiction / General", which is a bit stupid, so we have to split it
    // entry can also be just "Fiction", don't ask me, ask google
    // actually this is bisac format, which is really just a hierarchy of categories, so we  should NOT split it

    // if (entry.includes("/")) {
    //   for (const category of entry.split("/")) {
    //     categories.push(category.trim());
    //   }
    // } else {
    //   categories.push(entry);
    // }

    categories.push(entry);
  }

  return categories;
}

export function extractBookApiData(
  apiData: queriedBookFull
): Prisma.BookApiDataCreateInput {
  const info = apiData.volumeInfo;
  const { title, subtitle, publishedDate, publisher, pageCount, language } =
    info;
  const authors = info.authors.join("|"); //TODO: relation
  const thumbnailUrl = info.imageLinks?.thumbnail.replace(
    "http://",
    "https://"
  );
  const isbn_13 = info.industryIdentifiers?.find(
    (o) => o.type == "ISBN_13"
  )?.identifier;

  const imageLinks = info.imageLinks
    ? Object.fromEntries(
        Object.entries(info.imageLinks).map(([key, value]) => [
          key,
          typeof value === "string"
            ? value.replace("http://", "https://")
            : value,
        ])
      )
    : undefined;

  return {
    id: apiData.id,
    title,
    subtitle,
    authors,
    description: info.description,
    publishedDate,
    publisher,
    pageCount,
    language,
    thumbnailUrl,
    isbn_13,
    imageLinksJSON: JSON.stringify(imageLinks),
  };
}
