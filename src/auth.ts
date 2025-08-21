import { error, redirect } from "@sveltejs/kit";
import * as argon2 from "argon2";
import { StatusCodes } from "http-status-codes";

import type { Session } from "@auth/sveltekit";
import type { Account } from "@prisma/client";

import { prisma } from "$lib/server/prisma";
const { randomBytes } = await import("node:crypto");

export async function getAccountIdfromSession(session: Session | null) {
  let accountId = "dev";

  if (session?.user?.name == null) {
    error(401);
  }

  if (session?.user?.name != null) {
    const account = await getAccountByUsername(session?.user?.name);
    if (account != null) {
      accountId = account.id;
    } else if (!import.meta.env.DEV) {
      error(401);
    }
  }
  return accountId;
}

export async function getAccountByUsername(username: string) {
  return await prisma.account.findUnique({
    where: {
      username,
    },
  });
}

export async function checkBookAuth(
  locals: App.Locals,
  params: Partial<Record<string, string>>,
  bookListName: string | undefined = undefined
) {
  const session = await locals.auth();
  const sessionAccount =
    session?.user?.name != null
      ? await getAccountByUsername(session?.user?.name)
      : undefined;
  let username;

  if (params.username == null) {
    if (session?.user?.name != null) {
      username = session.user.name;
    } else {
      // error(StatusCodes.UNAUTHORIZED);
      redirect(302, "/login"); //TODO: add callbackurl
    }
  } else {
    username = params.username;
  }

  const account = await getAccountByUsername(username);
  const accountId = account?.id;

  if (accountId == null) {
    error(StatusCodes.NOT_FOUND);
  }

  if (!session) {
    error(StatusCodes.UNAUTHORIZED);
  }

  const bookListPublic =
    bookListName &&
    (
      await prisma.bookList.findUnique({
        where: { name_accountId: { name: bookListName, accountId } },
      })
    )?.visibility == "public";

  if (
    session.user?.name == username ||
    bookListPublic ||
    (account?.isPublic && bookListName == null) ||
    sessionAccount?.isAdmin ||
    import.meta.env.DEV
  ) {
    return accountId;
  } else {
    error(StatusCodes.FORBIDDEN);
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(64).toString("hex");
  const hash = await argon2.hash(password + salt);

  return {
    salt,
    hash,
  };
}

export async function verifyPassword(account: Account, password: string) {
  return await argon2.verify(
    account.password_hash,
    password + account.password_salt
  );
}
