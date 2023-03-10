import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

export async function load({ locals }: ServerLoadEvent) {  
  const session = await locals.getSession();
  if (!(!!session)) {
    throw error(401);
  }
  
  let data = {
    books: await prisma.book.findMany({
      where: {
        bookListName: "To read",
      },
      include: {
        rating: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    }),
  };

  return data;
}
