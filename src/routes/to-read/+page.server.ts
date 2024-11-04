import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

export async function load({ locals }: ServerLoadEvent) {
  const session = await locals.getSession();
  if (!session) {
    error(401);
  }

  const data = {
    books: await prisma.book.findMany({
      where: {
        bookListName: "To read",
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
