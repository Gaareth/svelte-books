import { BookSeries, PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

import { createLists, seedInitial } from "./seed-initial";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const books: { name: string; author: string; description: string }[] = [
  {
    name: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "A novel about racial injustice in the Deep South.",
  },
  {
    name: "1984",
    author: "George Orwell",
    description: "A dystopian story of surveillance and totalitarianism.",
  },
  {
    name: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A tale of wealth, love, and the American dream.",
  },
  {
    name: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    description: "The first adventure of a young wizard at Hogwarts.",
  },
  {
    name: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    description: "An epic fantasy quest to destroy the One Ring.",
  },
  {
    name: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A classic romance and social commentary.",
  },
  {
    name: "The Catcher in the Rye",
    author: "J.D. Salinger",
    description: "A story of teenage angst and alienation.",
  },
  {
    name: "Moby-Dick",
    author: "Herman Melville",
    description: "A whaling voyage and obsession with a white whale.",
  },
  {
    name: "War and Peace",
    author: "Leo Tolstoy",
    description:
      "A sweeping novel of Russian society during the Napoleonic era.",
  },
  {
    name: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "Bilbo Baggins embarks on a journey to reclaim treasure.",
  },
  {
    name: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    description: "A psychological drama of guilt and redemption.",
  },
  {
    name: "Brave New World",
    author: "Aldous Huxley",
    description: "A futuristic society shaped by technology and control.",
  },
  {
    name: "The Adventures of Huckleberry Finn",
    author: "Mark Twain",
    description: "A boy's journey down the Mississippi River.",
  },
  {
    name: "Jane Eyre",
    author: "Charlotte Brontë",
    description: "A young woman's struggle for independence and love.",
  },
  {
    name: "Wuthering Heights",
    author: "Emily Brontë",
    description: "A dark tale of passion and revenge on the Yorkshire moors.",
  },
  {
    name: "Flowers for Algernon",
    author: "Daniel Keyes",
    description:
      "A moving story of a man whose intelligence is artificially increased, exploring themes of identity and humanity.",
  },
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
