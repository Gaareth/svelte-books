import { DEFAULT_LISTS } from "$appTypes";
import { hashPassword } from "$lib/auth/auth";
import { prisma } from "$lib/server/prisma";
import {
  type BookList,
  type ReadingActivityStatus,
  ReadingActivityType,
  Visibility,
} from "$prismaClient";

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
  await createAllReadingActivityStatus(account.id);

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

export async function createAllReadingActivityStatus(
  accountId: string,
  checkExists = false
) {
  const lists: ReadingActivityStatus[] = [];

  for (const status of Object.values(ReadingActivityType)) {
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
          visibility: Visibility.PRIVATE,
        },
      })
    );
  }

  return lists;
}
