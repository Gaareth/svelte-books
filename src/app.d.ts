// See https://kit.svelte.dev/docs/types#app

import type { PrismaClient } from "@prisma/client";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
  const prisma: PrismaClient;
  declare const APP_VERSION: string;

  namespace svelteHTML {
    interface HTMLAttributes<T> {
      "on:click_outside"?: (event: CustomEvent) => void;
    }
  }
}

import { Prisma } from "@prisma/client";

export type BookIncludeCategory = Prisma.BookGetPayload<{
  include: {
    bookApiData: {
      include: {
        categories: true;
      };
    };
  };
}>;

export type BookFullType = Prisma.BookGetPayload<{
  select: { [K in keyof Required<Prisma.BookSelect>]: true };
}> &
  BookIncludeCategory;

export type BookRating = Prisma.BookGetPayload<{ include: { rating: true } }>;

export type ReadingActivityWithDates = Prisma.ReadingActivityGetPayload<{
  include: { dateFinished: true; dateStarted: true };
}>;

export type BookDate = Prisma.BookGetPayload<{
  include: {
    readingStatus: { include: { dateStarted: true; dateFinished: true } };
  };
}>;

// export type BookFull = BookRating &
//   Prisma.BookGetPayload<{ include: { bookApiData: true } }>;

export type BookListItemType = Prisma.BookGetPayload<{
  include: {
    bookApiData: {
      include: {
        categories: true;
      };
    };
  };
}>;

export type ReadingListItemType = Prisma.ReadingActivityGetPayload<{
  include: {
    rating: true;
    book: {
      include: {
        bookApiData: {
          include: {
            categories: true;
          };
        };
      };
    };
    dateStarted: true;
    dateFinished: true;
  };
}>;

export type ReviewListItemType = Prisma.ReadingActivityGetPayload<{
  include: {
    rating: true;
    dateStarted: true;
    dateFinished: true;
    storyGraphs: true;
    book: true;
  };
}>;

export type BookFull = Prisma.BookGetPayload<{
  include: {
    rating: true;
    dateStarted: true;
    dateFinished: true;
    bookSeries: {
      include: {
        books: {
          include: {
            rating: true;
            dateStarted: true;
            dateFinished: true;
            bookApiData: {
              include: {
                categories: true;
              };
            };
          };
        };
      };
    };
    bookApiData: {
      include: {
        categories: true;
      };
    };
  };
}>;

export type BookApiDataCategories = Prisma.BookApiDataGetPayload<{
  include: { categories: true };
}>;

export type queriedBook = {
  id: string;
  volumeInfo: {
    title: string;
    subtitle: string;
    authors: string[];
    imageLinks: { smallThumbnail: string; thumbnail: string };
  };
};

export const QUERIED_BOOK_FULL_FIELDS = `
  id,
  volumeInfo(
    title,
    subtitle,
    authors,
    description,
    publishedDate,
    publisher,
    industryIdentifiers,
    imageLinks,
    pageCount,
    printedPageCount,
    categories,
    language
  )
`;

export type ImageLinksType = {
  smallThumbnail: string;
  thumbnail: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
};

export type queriedBookFull = {
  id: string;
  volumeInfo: {
    title: string;
    subtitle: string | undefined;
    authors: string[];
    description: string | undefined;
    publishedDate: string | undefined;
    publisher: string | undefined;
    industryIdentifiers:
      | {
          type: string | undefined;
          identifier: string | undefined;
        }[]
      | undefined;
    imageLinks: ImageLinksType | undefined;
    pageCount: number | undefined;
    printedPageCount: number | undefined;
    categories: string[] | undefined;
    language: string;
  };
};

export const DEFAULT_LISTS = ["Read", "Reading", "To read"] as const;
export type DEFAULT_LIST = (typeof DEFAULT_LISTS)[number];

export const READING_STATUS = {
  TO_READ: "to read",
  READING: "reading",
  FINISHED: "finished",
  DID_NOT_FINISH: "did not finish",
  PAUSED: "paused",
} as const;
export type READING_STATUS =
  (typeof READING_STATUS)[keyof typeof READING_STATUS];

export const READING_STATUS_VALUES = Object.values(READING_STATUS) as Array<
  (typeof READING_STATUS)[keyof typeof READING_STATUS]
>;
// Ensure READING_STATUS_VALUES is a tuple for Zod enum
export const READING_STATUS_VALUES_TUPLE = READING_STATUS_VALUES as [
  string,
  ...string[]
];
export {};
