import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { z } from "zod";
import { prisma } from "$lib/server/prisma";
import { getBookApiData } from "../api/api.server";
import { extractBookApiData, extractCategories } from "$lib/server/db/utils";
import type { queriedBookFull } from "$appTypes";

const createSchema = z.object({
  name: z.string().trim().min(1),
  author: z.string().trim().min(1),
  listName: z.string().trim().min(1),
  volumeId: z.string().trim().optional(),
});



export async function POST(req: RequestEvent) {
  const session = await req.locals.getSession();
  if (!session) {
    throw error(401);
  }

  const result = createSchema.safeParse(await req.request.json());
  console.log(result);

  if (result.success) {
    const { name, author, listName, volumeId } = result.data;

    const book_exist = await prisma.book.findFirst({ where: { name } });
    if (book_exist) {
      return json({
        success: false,
        message: "Books titles have to be unique.\nPlease use another title",
      });
    }
    // } catch { /* errors if bookApiData does not exits. Will be created in the next create call below.*/ }
    // return json({ success: true });

    await prisma.book.create({
      data: {
        name,
        author,
        bookList: {
          connectOrCreate: {
            where: {
              name: listName,
            },
            create: {
              name: listName,
            },
          },
        },
      },
    });

    if (volumeId !== undefined) {
      const apiData = await getBookApiData(volumeId);
      console.log(apiData);

      const extractedData = extractBookApiData(apiData);

      const bookApiData = await prisma.bookApiData.findUnique({
        where: { id: apiData.id },
      });

      if (bookApiData !== null) {
        await prisma.bookApiData.update({
          where: { id: apiData.id },
          data: extractedData,
        });
        // message = `Updated api data (${apiData.id}) from ${bookApiData?.title} to ${name}`;
      }

      await prisma.book.update({
        where: { name },
        data: {
          bookApiData: {
            connectOrCreate: {
              where: { id: apiData.id },
              create: extractedData,
            },
          },
        },
      });

      const categories = extractCategories(apiData);
      
      console.log(categories);
      
      for (const category_str of categories) {
        const category = await prisma.bookCategory.upsert({
          where: { name: category_str },
          update: {
            name: category_str,
            books: { connect: { id: apiData.id } },
          },
          create: {
            name: category_str,
            books: { connect: { id: apiData.id } },
          },
        });

        console.log(category);
        
      }
    }

    return json({ success: true });
  }
  throw error(400);
}

