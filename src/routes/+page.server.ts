import { prisma } from "$lib/server/prisma";
import type { Book } from "@prisma/client";

function getReadDate(book: Book) {
  if (book.yearRead === null || book.monthRead === null) {
    return null;
  }
  return new Date(book.yearRead, book.monthRead - 1);
}

export async function load({ url }: any) {
  let data = {
    books: await prisma.book.findMany({
      where: {
        bookListName: "Read",
      },
      include: {
        rating: true,
      },
    }),
  };

  data.books = data.books.sort(function (a: Book, b: Book) {
    const ad = getReadDate(a) ?? a.createdAt;
    const bd = getReadDate(b) ?? b.createdAt;
    return (ad.getTime() - bd.getTime()) * -1;
  });

  return data;
}
