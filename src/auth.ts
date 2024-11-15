import { prisma } from "$lib/server/prisma";
import type { Session } from "@auth/sveltekit";
import { error, redirect } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

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
  params: Partial<Record<string, string>>
) {
  const session = await locals.auth();
  let username;

  if (params.username == null) {
    if (session?.user?.name != null) {
      username = session.user.name;
    } else {
      // error(StatusCodes.UNAUTHORIZED);
      redirect(302, "/login" ); //TODO: add callbackurl
    }
  } else {
    username = params.username;
  }

  const accountId = (await getAccountByUsername(username))?.id;

  if (accountId == null) {
    error(StatusCodes.NOT_FOUND);
  }

  if (!session) {
    error(StatusCodes.UNAUTHORIZED);
  }

  if (session.user?.name != params.username && !import.meta.env.DEV) {
    error(StatusCodes.FORBIDDEN);
  }

  return accountId;
}
