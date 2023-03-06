import { getBookLists } from "$lib/server/db/utils";
import { prisma } from "$lib/server/prisma";
import { error, type ServerLoadEvent } from "@sveltejs/kit";
import { append } from "svelte/internal";
import { redirect } from "sveltekit-flash-message/server";
import type { Action, PageServerLoad, RequestEvent } from "./$types";

export async function load(page: ServerLoadEvent) {
  const params = page.params;

  const edit = page.url.searchParams.get("edit");
  console.log(edit);
  
  
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
    edit
  };
}

export const actions = {
  save: async (event: RequestEvent) => {
    const data = await event.request.formData();
    console.log(data);

    const id = data.get("id")?.toString();
    const name = data.get("name")?.toString();
    const author = data.get("author")?.toString();
    let comment = data.get("comment")?.toString();
    const stars = data.get("stars")?.toString();
    const monthRead = data.get("month")?.toString();
    const yearRead = data.get("year")?.toString();
    const listName = data.get("listName")?.toString();

    if (
      id === undefined ||
      name === undefined ||
      author === undefined ||
      comment === undefined ||
      stars === undefined ||
      monthRead === undefined ||
      yearRead === undefined ||
      listName === undefined
    ) {
      return { success: false };
    }

    const stars_number = parseInt(stars);
    if (Number.isNaN(stars_number)) {
      return { success: false };
    }

    const month_number = parseInt(monthRead);
    if (Number.isNaN(month_number)) {
      return { success: false };
    }
    const year_number = parseInt(yearRead);
    if (Number.isNaN(year_number)) {
      return { success: false };
    }

    comment = comment.trim();

    const book = await prisma.book.update({
      where: { id },
      data: {
        name,
        author,
        monthRead: month_number,
        yearRead: year_number,
        rating: {
          upsert: {
            update: { stars: stars_number, comment },
            create: { stars: stars_number, comment },
          },
        },
        bookList: {
          connect: {
            name: listName,
          },
        },
      },
    });
    console.log(book);

    const message = {
      type: "success",
      message: "Successfully updated book details",
    };
    throw redirect(303, "/book/" + name, message, event);
  },
  delete: async (event: RequestEvent) => {
    const data = await event.request.formData();
    console.log(data);

    const id = data.get("id")?.toString();
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

    throw redirect(303, "/?success=true");
  },
};
