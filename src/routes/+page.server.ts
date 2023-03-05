import { prisma } from "$lib/server/prisma";

export async function load({ url }: any) {
  let data = {
    books: await prisma.book.findMany(({
      where: {
        bookListName: "Read"
      }
    })),
  };
  
  return data;
}

