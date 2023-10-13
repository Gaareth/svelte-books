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

export type BookFullType = Prisma.BookGetPayload<{
  select: { [K in keyof Required<Prisma.BookSelect>]: true };
}>;

export type BookRating = Prisma.BookGetPayload<{ include: { rating: true } }>;

export type BookApiDataFullType = Prisma.BookApiDataGetPayload<{
  select: { [K in keyof Required<Prisma.BookApiDataSelect>]: true };
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
    subtitle: string;
    authors: string[];
    publishedDate: string;
    publisher: string;
    industryIdentifiers: {
      type: string | undefined;
      identifier: string | undefined;
    }[];
    imageLinks: { smallThumbnail: string; thumbnail: string };
    pageCount: number;
    printedPageCount: number;
    categories: string[] | undefined;
    language: string;
  };
};



export {};
