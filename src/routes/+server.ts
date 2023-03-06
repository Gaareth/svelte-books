import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST(req: RequestEvent) {
  const { name, author, listName } = await req.request.json();
  if (!name || !author || !listName) {
    return json({ success: false });
  }

  const book = await prisma.book.create({
    data: { 
        name, 
        author,
        bookList: {
            connect: {
                name: listName
            }
        }
    },
  });
  console.log(book);
  console.log("returnging;:" + json({ success: true }));
  

  return json({ success: true });
}
