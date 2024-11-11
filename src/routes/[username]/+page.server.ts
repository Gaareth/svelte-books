import { prisma } from "$lib/server/prisma";
import { error, type ServerLoadEvent } from "@sveltejs/kit";

export async function load({ locals, params  }: ServerLoadEvent) {

  const session = await locals.auth();
  if (!session) {
    error(401);
  }

  const most_read_categories = await prisma.bookCategory.findMany({
    include: {
      _count: {
        select: { books: true },
      },
    },
    orderBy: { books: { _count: "desc" } },
  });
  // console.log(most_read_category);

  const all_category_names = await prisma.bookCategory.findMany({
    select: {
      name: true,
    },
  });

  return {
    books: (await loadBooks(session?.user?.id)).books,
    currentlyReading: (await loadBooks("Reading")).books,
    most_read_categories: most_read_categories.map((c) => [
      c.name,
      c._count.books,
    ]),
    all_category_names,
  };
}
