export async function load({ url }: any) {
    console.log("loading to read data");
    
  let data = {
    books: await prisma.book.findMany({
      where: {
        bookListName: "To read",
      },
    }),
  };

  return data;
}
