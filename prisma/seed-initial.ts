import { PrismaClient, type BookList } from "@prisma/client";
import dotenv from "dotenv";

import { DEFAULT_LISTS } from "../src/app.d";
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

  return await prisma.account.create({
    data: {
      username: username,
      password_hash: hash,
      password_salt: salt,
      isAdmin: admin,
    },
  });
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

export async function seedInitial() {
  const account = await createAccount(true);
  return {
    account,
    serverSettings: await createServerSettings(),
    lists: await createLists(account.id),
  };
}
