import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST(req: RequestEvent) {
  const { id } = await req.request.json();
  if (id === undefined) {
    return { success: false };
  }

  const book = await prisma.book.delete({
    where: {
      id: id,
    },
  });

 
  return json({ success: true });
}
