import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";
import { checkBookAuth } from "../../../auth";

export async function load({ locals, params }: ServerLoadEvent) {
  const accountId = await checkBookAuth(locals, params);

  const data = {
    books: await prisma.book.findMany({
      where: {
        bookListName: "To read",
        accountId,
      },
      include: {
        rating: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    category_names: await prisma.bookCategory.findMany({
      select: {
        name: true,
      },
    }),
  };

  return data;
}
