import { prisma } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import { append } from "svelte/internal";
import { redirect } from "sveltekit-flash-message/server";
import type { Action, RequestEvent } from "./$types";

export async function load({ params }: any) {
  const book = await prisma.book.findFirst({
    where: {
      name: params.name,
    },
    include: {
      rating: true,
    },
  });
  console.log(book);

  if (!book) {
    throw error(404, { message: "Not found" });
  }

  return {
    book,
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


    if (
      id === undefined ||
      name === undefined ||
      author === undefined ||
      comment === undefined ||
      stars === undefined
    ) {
      return { success: false };
    }

    const stars_number = parseInt(stars);
    if (Number.isNaN(stars_number)) {
      return { success: false };
    }

    comment = comment.trim();

    const book = await prisma.book.update({
      where: { id },
      data: {
        name,
        author,
        monthRead,
        rating: {
          upsert: {
            update: { stars: stars_number, comment },
            create: { stars: stars_number, comment },
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
