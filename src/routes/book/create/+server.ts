import { error, json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { z } from "zod";
import { prisma } from "$lib/server/prisma";
import { getBookApiData, type queriedBookFull } from "../api/api.server";

const createSchema = z.object({
  name: z.string().trim().min(1),
  author: z.string().trim().min(1),
  listName: z.string().trim().min(1),
  volumeId: z.string().trim().optional(),
});

function extractBookApiData(apiData: queriedBookFull) {
  const info = apiData.volumeInfo;
  const { title, subtitle, publishedDate, publisher, pageCount, language } =
    info;
  const authors = info.authors.join("|"); //TODO: relation
  const thumbnailUrl = info.imageLinks.thumbnail;
  const isbn_13 = info.industryIdentifiers.find(
    (o) => o.type == "ISBN_13"
  )?.identifier;

  return {
    id: apiData.id,
    title,
    subtitle,
    authors,
    publishedDate,
    publisher,
    pageCount,
    language,
    thumbnailUrl,
    isbn_13,
  };
}

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
          connect: {
            name: listName,
          },
        },
      },
    });

    if (volumeId !== undefined) {
      const apiData = await getBookApiData(volumeId);
      console.log(apiData);

      const bookApiData = await prisma.bookApiData.findUnique({
        where: { id: apiData.id },
      });

      const extractedData = extractBookApiData(apiData);


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
      
    }

    return json({ success: true });
  }
  throw error(400);
}
