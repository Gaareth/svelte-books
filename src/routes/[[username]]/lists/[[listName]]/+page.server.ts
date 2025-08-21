// import { loadBooks } from "$lib/server/db/utils";
// import { prisma } from "$lib/server/prisma";
// import { type ServerLoadEvent } from "@sveltejs/kit";
// import { checkBookAuth } from "../../../../auth";

// export async function load({ locals, params }: ServerLoadEvent) {
//   const username = params.username;
//   const accountId = await checkBookAuth(locals, params);

//   const data = {
//     books: (await loadBooks({ accountId }, listName)).books,
//     category_names: await prisma.bookCategory.findMany({
//       select: {
//         name: true,
//       },
//     }),
//   };

//   return { ...data, username, listName, exists: true };
// }
