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

// export type BookFull = BookRating &
//   Prisma.BookGetPayload<{ include: { bookApiData: true } }>;

export type BookListItemType = Prisma.BookGetPayload<{
  include: {
    rating: true;
    bookApiData: {
      include: {
        categories: true;
      };
    };
  };
}>;

export type BookFull = Prisma.BookGetPayload<{
  include: {
    rating: true;
    bookSeries: {
      include: {
        books: {
          include: {
            rating: true;
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

export type queriedBookFull = {
  id: string;
  volumeInfo: {
    title: string;
    subtitle: string | undefined;
    authors: string[];
    publishedDate: string | undefined;
    publisher: string | undefined;
    industryIdentifiers:
      | {
          type: string | undefined;
          identifier: string | undefined;
        }[]
      | undefined;
    imageLinks: { smallThumbnail: string; thumbnail: string } | undefined;
    pageCount: number | undefined;
    printedPageCount: number | undefined;
    categories: string[] | undefined;
    language: string;
  };
};

export {};
