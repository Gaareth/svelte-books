import { Prisma, PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

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

async function createAccount() {
  const hash = await argon2.hash(process.env.password);
  return await prisma.account.create({
    data: {
      username: process.env.username,
      password_hash: hash,
      isAdmin: true,
    },
  });
}

async function createServerSettings() {
  return await prisma.serverSettings.create({
    data: {
      registrationPossible: false,
    },
  });
}

async function createSeries() {
  const lists = [];

  const list1 = await prisma.bookSeries.create();

  const list2 = await prisma.bookSeries.create();
  lists.push(list1);
  lists.push(list2);

  return lists;
}

async function createList() {
  const lists = [];

  const list1 = await prisma.bookList.create({
    data: {
      name: "Read",
    },
  });

  const list2 = await prisma.bookList.create({
    data: {
      name: "To read",
    },
  });
  lists.push(list1);
  lists.push(list2);

  return lists;
}

async function main() {
  let account = await createAccount();
  // return;
  await createServerSettings();

  await prisma.account.create({
    data: {
      username: "bob",
      password_hash: await argon2.hash("bob"),
    },
  });

  const series = await createSeries();
  const lists = await createList();
  // return;

  for (const b of books) {
    await prisma.book.create({
      data: {
        ...b,
        bookList: {
          connect: {
            name: lists[0].name,
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
          name: lists[0].name,
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
          name: lists[0].name,
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
