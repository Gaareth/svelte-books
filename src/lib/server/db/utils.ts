import { prisma } from "$lib/server/prisma";
import type { Book } from "@prisma/client";

export async function getBookLists() {
  return prisma.bookList.findMany();
}

function getReadDate(book: Book) {
  if (book.yearRead === null) {
    return null;
  }
  return new Date(book.yearRead, (book.monthRead ?? 0) - 1);
}

// function sortBooksBy

export async function loadBooks() {
  const data = {
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
    const read_date_a = getReadDate(a);
    const read_date_b = getReadDate(b);

    let date_a: Date = read_date_a ?? a.createdAt;
    let date_b: Date = read_date_b ?? b.createdAt;

    // sort by date added, when the read date is the same
    if (
      read_date_a?.getTime() == read_date_b?.getTime()
    ) {
      date_a = a.createdAt;
      date_b = b.createdAt;
    }

    return (date_a.getTime() - date_b.getTime()) * -1;
  });

  return data;
}
