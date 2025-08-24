import { getAccountByUsername } from "../../auth";

import type { ServerLoadEvent } from "@sveltejs/kit";

import { VISIBILITY } from "$appTypes";
import { prisma } from "$lib/server/prisma";

export async function load({ locals }: ServerLoadEvent) {
  const session = await locals.auth();
  /*   if (session?.user?.name == null) {
    error(StatusCodes.UNAUTHORIZED);
  } */

  const username = session?.user?.name;
  const account = username ? await getAccountByUsername(username) : undefined;

  const accounts = await prisma.account.findMany({
    where: {
      isPublic: account?.isAdmin ? undefined : true,
    },
    include: {
      books: {
        select: {
          bookList: true,
        },
      },
      readingActivityStatus: true,
    },
  });

  const users = accounts.map((a) => {
    return {
      username: a.username,
      numBooks: a.books.length,
      readingActivityLists: a.readingActivityStatus.filter(
        (r) => r.visibility == VISIBILITY.PUBLIC || account?.isAdmin
      ),
    };
  });

  return { users };
}
