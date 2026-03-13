import { error, redirect } from "@sveltejs/kit";
import * as argon2 from "argon2";
import { StatusCodes } from "http-status-codes";

import type { ReadingActivityType } from "$prismaClient";
import { Visibility, type Account } from "$prismaClient";
import type { Session } from "@auth/sveltekit";

import { prisma } from "$lib/server/prisma";
const { randomBytes } = await import("node:crypto");

export async function getAccountIdfromSession(session: Session | null) {
  if (session?.user?.name == null) {
    error(401);
  }

  const account = await getAccountByUsername(session?.user?.name);
  if (account != null) {
    return account.id;
  } else {
    error(StatusCodes.NOT_FOUND, "No account linked to session found");
  }
}

export async function getAccountByUsername(username: string) {
  return await prisma.account.findUnique({
    where: {
      username,
    },
  });
}

export async function adminAuth(session: Session | null) {
  const account = await userAuth(session);
  if (!account?.isAdmin) {
    error(StatusCodes.FORBIDDEN, "You are not authorized");
  }

  return account;
}

export async function userAuth(session: Session | null) {
  if (session?.user?.name == null) {
    // for user pages if you are not logged in then redirect to login
    // error(StatusCodes.UNAUTHORIZED);
    redirect(302, "/login"); //TODO: add callbackurl
  }

  const account = await getAccountByUsername(session.user.name);

  // there is a session but no linked account
  if (account == null) {
    // account deleted?
    error(StatusCodes.NOT_FOUND);
  }
  return account;
}

export function handlePublicOrAuthenticatedAccount(
  requestedAccount: Account,
  sessionAccount: Account | null
) {
  return visibilityIsPublicOrAuthenticated(
    requestedAccount.visibility,
    sessionAccount
  );
}

export function visibilityIsPublicOrAuthenticated(
  visibility: Visibility,
  session: Session | Account | null
) {
  return (
    visibility === Visibility.PUBLIC ||
    (visibility === Visibility.AUTHENTICATED && session != null)
  );
}

export async function authorize(
  session: Session | null,
  requestedAccountUsername?: string,
  isPublicPage: (
    requestedAccount: Account,
    sessionAccount: Account | null
  ) => boolean | Promise<boolean> = () => false
): Promise<{
  sessionAccount: Account | null;
  requestedAccount: Account;
}> {
  let sessionAccount: Account | null = null;
  if (session?.user?.name != null) {
    sessionAccount = await getAccountByUsername(session.user.name);
    // there is a session but no linked account
    if (sessionAccount == null) {
      return error(
        StatusCodes.NOT_FOUND,
        "No account linked to session found. Did you delete your account?"
      );
    }
  }
  const isPrivatePage = requestedAccountUsername == null;

  if (isPrivatePage) {
    if (sessionAccount == null) {
      return redirect(StatusCodes.MOVED_TEMPORARILY, "/login");
    } else {
      return { sessionAccount, requestedAccount: sessionAccount };
    }
  }

  const requestedAccount = await getAccountByUsername(requestedAccountUsername);
  if (requestedAccount == null) {
    return error(StatusCodes.NOT_FOUND, "Requested account not found");
  }

  const allow =
    (await isPublicPage(requestedAccount, sessionAccount)) ||
    sessionAccount?.id === requestedAccount?.id ||
    sessionAccount?.isAdmin;

  if (allow) {
    return { sessionAccount, requestedAccount };
  }

  return error(StatusCodes.FORBIDDEN, "You are not authorized");
}

export async function isReadingActivityPublic(
  accountId: string,
  session: Session | Account | null,
  readingActivityStatus: ReadingActivityType
) {
  const readingActivity = await prisma.readingActivityStatus.findUnique({
    where: {
      status_accountId: { status: readingActivityStatus, accountId },
    },
  });

  const visibility = readingActivity?.visibility;
  if (visibility == null) {
    // default to private if not found, should not happen
    return false;
  }

  return visibilityIsPublicOrAuthenticated(visibility, session);
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
