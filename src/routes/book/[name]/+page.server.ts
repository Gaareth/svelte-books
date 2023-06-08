import { getBookLists } from "$lib/server/db/utils";
import { prisma } from "$lib/server/prisma";
import { error, redirect, type ServerLoadEvent } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { z } from "zod";

export async function load(page: ServerLoadEvent) {
  const params = page.params;

  const edit = page.url.searchParams.get("edit");
  
  const book = await prisma.book.findFirst({
    where: {
      name: params.name,
    },
    include: {
      rating: true,
    },
  });

  const bookLists = await getBookLists();

  if (!book) {
    throw error(404, { message: "Not found" });
  }

  return {
    book,
    bookLists,
    edit,
  };
}

const saveSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  author: z.string().trim().min(1),
  comment: z.string().trim().optional(),
  stars: z.coerce.number().min(0).max(5),
  month: z.coerce.number().min(0).max(12).optional(),
  year: z.coerce.number().min(0).max(5000).optional(),
  listName: z.string(),
});

function undefinedToNull<Type>(any: Type | undefined): Type | null {
  return any === undefined ? null : any;
}

export const actions = {
  save: async (event: RequestEvent) => {
    const session = await event.locals.getSession();
    if (!(session)) {
      throw error(401)
    }

    const formData = Object.fromEntries(await event.request.formData());
    console.log(formData);
    if (formData.year == '') {
      delete formData.year;
    } 
    console.log(formData);

    
    const result =
      saveSchema.safeParse(formData);
    
      if (result.success) {
        const { id, name, author, comment, stars, month, year, listName } =
          result.data;


        const book = await prisma.book.update({
          where: { id },
          data: {
            name,
            author,
            monthRead: undefinedToNull(month),
            yearRead: undefinedToNull(year),
            rating: {
              upsert: {
                update: { stars: stars, comment },
                create: { stars: stars, comment },
              },
            },
            bookList: {
              connect: {
                name: listName,
              },
            },
          },
        });
        
        throw redirect(302, "/book/" + encodeURIComponent(book.name));
      }

  
    const { fieldErrors: errors } = result.error.flatten();

    return {
      data: formData,
      errors,
    };

  },
};
