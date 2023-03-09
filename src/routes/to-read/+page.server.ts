import { error, type ServerLoadEvent } from "@sveltejs/kit";

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
    }),
  };

  return data;
}
