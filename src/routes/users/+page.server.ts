import { getAccountByUsername } from "../../auth";

import type { ServerLoadEvent } from "@sveltejs/kit";

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
      isPublic: true,
    },
    include: {
      books: {
        select: {
          bookList: true,
        },
      },
      bookList: true,
    },
  });

  const users = accounts.map((a) => {
    return {
      username: a.username,
      numBooks: a.books.length,
      lists: a.bookList.filter(
        (b) => b.visibility == "public" || account?.isAdmin
      ),
    };
  });

  return { users };
}
