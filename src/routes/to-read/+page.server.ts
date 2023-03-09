export async function load({ url }: any) {    
  let data = {
    books: await prisma.book.findMany({
      where: {
        bookListName: "To read",
      },
    }),
  };

  return data;
}
