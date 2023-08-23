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
  declare const VERSION: string;
}

import { Prisma } from "@prisma/client";

export type BookFullType = Prisma.BookGetPayload<{
  select: { [K in keyof Required<Prisma.BookSelect>]: true };
}>;

export type BookRating = Prisma.BookGetPayload<{ include: { rating: true } }>;

export {};
