import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

export async function POST(req: RequestEvent) {
    const {name, author} = await req.request.json();
    if (!name || !author) {
        return json({success: false});
    }

    const book = await prisma.book.create({
        data: {name, author}
    });
    console.log(book);
    

    return json({success: true})
}