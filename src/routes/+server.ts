import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1),
  author: z.string().trim().min(1),
  listName: z.string().trim().min(1),
});

export async function POST(req: RequestEvent) {
  const session = await req.locals.getSession();
  if (!!!session) {
    throw error(401);
  }

  const result = createSchema.safeParse(await req.request.json());
  if (result.success) {
    const { name, author, listName } = result.data;
    const book = await prisma.book.create({
      data: {
        name,
        author,
        bookList: {
          connect: {
            name: listName,
          },
        },
      },
    });

    return json({ success: true });
  }
  throw error(400);
}
