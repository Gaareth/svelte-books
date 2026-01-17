import {
  PrismaClient,
  type BookList,
  type ReadingActivityStatus,
} from "@prisma/client";
import dotenv from "dotenv";

import { DEFAULT_LISTS, READING_STATUS_VALUES, VISIBILITY } from "../src/app.d";
import { hashPassword } from "../src/auth";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

export async function createAccount(admin = false) {
  const username = process.env.username;
  const password = process.env.password;

  if (!username) {
    throw Error("username env variable must not be empty");
  }

  if (!password) {
    throw Error("password env variable must not be empty");
  }

  const { hash, salt } = await hashPassword(password);

  const account = await prisma.account.create({
    data: {
      username: username,
      password_hash: hash,
      password_salt: salt,
      isAdmin: admin,
    },
  });

  await createLists(account.id);
  await createReadingActivityStatus(account.id);

  return account;
}

export async function createServerSettings() {
  return await prisma.serverSettings.create({
    data: {
      registrationPossible: false,
    },
  });
}

export async function createLists(accountId: string) {
  const lists: BookList[] = [];

  for (const name of DEFAULT_LISTS) {
    lists.push(
      await prisma.bookList.create({
        data: {
          name,
          accountId,
        },
      })
    );
  }

  return lists;
}

export async function createReadingActivityStatus(
  accountId: string,
  checkExists = false
) {
  const lists: ReadingActivityStatus[] = [];

  for (const status of READING_STATUS_VALUES) {
    if (checkExists) {
      const exists = await prisma.readingActivityStatus.findFirst({
        where: {
          status,
          accountId,
        },
      });

      if (exists) {
        continue;
      }
    }

    lists.push(
      await prisma.readingActivityStatus.create({
        data: {
          status,
          accountId,
          visibility: VISIBILITY.PRIVATE,
        },
      })
    );
  }

  return lists;
}

export async function seedInitialAllAccounts() {
  const accounts = await prisma.account.findMany();
  for (const account of accounts) {
    try {
      await createReadingActivityStatus(account.id, true);
    } catch (error) {
      console.error(
        `[!] failed to seed initial data for account ${account.id}:`,
        error
      );
    }
  }
}

export async function seedInitial() {
  const account = await createAccount(true);
  return {
    account,
    serverSettings: await createServerSettings(),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedInitial()
    .then(() => {
      console.log("Seeding complete.");
      prisma.$disconnect();
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      prisma.$disconnect();
      process.exit(1);
    });
}
