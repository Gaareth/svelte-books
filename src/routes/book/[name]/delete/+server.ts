import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST(req: RequestEvent) {
  const { id } = await req.request.json();
  // console.log(data);
  if (id === undefined) {
    return { success: false };
  }

  const book = await prisma.book.delete({
    where: {
      id: id,
    },
  });
  console.log("deleted book:" + book.name);

  const message = {
    type: "success",
    message: "Successfully deleted book " + book.name,
  };

  return json({ success: true });
}
