import { loadBooks } from "$lib/server/db/utils";
import { prisma } from "$lib/server/prisma";

export async function load() {
  const most_read_category = await prisma.bookCategory.findFirst({
    include: {
      _count: {
        select: { books: true },
      },
    },
    orderBy: { books: { _count: "desc" } },
  });
  console.log(most_read_category);

  const all_category_names = await prisma.bookCategory.findMany({
    select: {
      name: true
    }
  });
  

  return {
    books: (await loadBooks()).books,
    most_read_category: [most_read_category?.name, most_read_category?._count.books],
    all_category_names
  };
}
