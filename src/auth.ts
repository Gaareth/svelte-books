import { prisma } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

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
  if (params.username == null) {
    error(StatusCodes.BAD_REQUEST);
  }
  const accountId = (await getAccountByUsername(params.username))?.id;

  if (accountId == null) {
    error(StatusCodes.NOT_FOUND);
  }

  const session = await locals.auth();
  if (!session) {
    error(StatusCodes.UNAUTHORIZED);
  }

  if (session.user?.name != params.username && !import.meta.env.DEV) {
    error(StatusCodes.FORBIDDEN);
  }

  return accountId;
}
