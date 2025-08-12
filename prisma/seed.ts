import { BookSeries, PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { createLists, seedInitial } from "./seed-initial";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const books: { name: string; author: string }[] = [
  { name: "To Kill a Mockingbird", author: "Harper Lee" },
  { name: "1984", author: "George Orwell" },
  { name: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { name: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling" },
  { name: "The Lord of the Rings", author: "J.R.R. Tolkien" },
  { name: "Pride and Prejudice", author: "Jane Austen" },
  { name: "The Catcher in the Rye", author: "J.D. Salinger" },
  { name: "Moby-Dick", author: "Herman Melville" },
  { name: "War and Peace", author: "Leo Tolstoy" },
  { name: "The Hobbit", author: "J.R.R. Tolkien" },
  { name: "Crime and Punishment", author: "Fyodor Dostoevsky" },
  { name: "Brave New World", author: "Aldous Huxley" },
  { name: "The Adventures of Huckleberry Finn", author: "Mark Twain" },
  { name: "Jane Eyre", author: "Charlotte Brontë" },
  { name: "Wuthering Heights", author: "Emily Brontë" },
];

async function createSeries() {
  const lists: BookSeries[] = [];

  const list1 = await prisma.bookSeries.create({});
  const list2 = await prisma.bookSeries.create({});
  lists.push(list1);
  lists.push(list2);

  return lists;
}

async function createDummyAccounts() {
  const createDummyAccount = async (username: string) => {
    const acc = await prisma.account.create({
      data: {
        username: username,
        password_hash: "hash",
        password_salt: "salt",
        isAdmin: false,
      },
    });

    await createLists(acc.id);
  };

  await createDummyAccount("Carlos");
  await createDummyAccount("JS Bach");
}

async function createBooks(account) {
  for (const bookData of books) {
    const createdBook = await prisma.book.create({
      data: {
        ...bookData,
        account: {
          connect: {
            id: account.id,
          },
        },
      },
    });

    await prisma.readingActivity.create({
      data: {
        account: {
          connect: {
            id: account.id,
          },
        },
        book: {
          connect: {
            id: createdBook.id,
          },
        },
        status: "finished",
        dateStarted: {
          create: {
            day: 1,
            month: 1,
            year: 2020,
            hour: 12,
            minute: 0,
            timezoneOffset: 0,
          },
        },
        dateFinished: {
          create: {
            day: 1,
            month: 1,
            year: 2021,
            hour: 12,
            minute: 0,
            timezoneOffset: 0,
          },
        },
        rating: {
          create: {
            stars: Math.floor(Math.random() * 5) + 1,
            comment: "This is a dummy rating",
          },
        },
      },
    });
  }
}

async function main() {
  const { account, lists } = await seedInitial();
  const series = await createSeries();
  // return;

  await createDummyAccounts();
  await createBooks(account);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });

// await prisma.book.create({
//     data: {
//       name: "in series",
//       author: "chukc nockis",
//       bookList: {
//         connect: {
//           id: lists[0].id,
//         },
//       },
//       bookSeries: {
//         connect: {
//           id: series[0].id,
//         },
//       },
//       account: {
//         connect: {
//           id: account.id,
//         },
//       },
//     },
//   });

//   await prisma.book.create({
//     data: {
//       name: "in series 2",
//       author: "chukc nockis",
//       bookList: {
//         connect: {
//           id: lists[0].id,
//         },
//       },
//       bookSeries: {
//         connect: {
//           id: series[0].id,
//         },
//       },
//       account: {
//         connect: {
//           id: account.id,
//         },
//       },
//     },
//   });
