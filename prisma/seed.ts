import { BookList, BookSeries, Prisma, PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import * as auth from "../src/auth";
import { createLists, seedInitial } from "./seed-initial";

const prisma = new PrismaClient();

const books = [
  {
    name: "firstbook",
    author: "john doe",
    monthRead: 4,
    yearRead: 2022,
    rating: {
      create: { stars: 1 },
    },
  },
  {
    name: "second",
    author: "dohn joe",
    monthRead: 4,
    yearRead: 2022,
    rating: {
      create: { stars: 3 },
    },
  },
  {
    name: "thied book",
    author: "john doe",
    monthRead: 4,
    yearRead: 2022,
    rating: {
      create: { stars: 5 },
    },
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

async function main() {
  const { account, lists } = await seedInitial();
  const series = await createSeries();
  // return;

  await createDummyAccounts();

  for (const b of books) {
    await prisma.book.create({
      data: {
        ...b,
        bookList: {
          connect: {
            name_accountId: {
              accountId: account.id,
              name: lists[0].name,
            },
          },
        },
        account: {
          connect: {
            id: account.id,
          },
        },
      },
    });
  }

  await prisma.book.create({
    data: {
      name: "in series",
      author: "chukc nockis",
      bookList: {
        connect: {
          id: lists[0].id,
        },
      },
      bookSeries: {
        connect: {
          id: series[0].id,
        },
      },
      account: {
        connect: {
          id: account.id,
        },
      },
    },
  });

  await prisma.book.create({
    data: {
      name: "in series 2",
      author: "chukc nockis",
      bookList: {
        connect: {
          id: lists[0].id,
        },
      },
      bookSeries: {
        connect: {
          id: series[0].id,
        },
      },
      account: {
        connect: {
          id: account.id,
        },
      },
    },
  });
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
