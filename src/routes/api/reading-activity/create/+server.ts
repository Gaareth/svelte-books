import { READING_STATUS_VALUES_TUPLE } from "$appTypes";
import { prisma } from "$lib/server/prisma";
import { json } from "@sveltejs/kit";
import z from "zod";
import { checkBookAuth } from "../../../../auth";
import {
  optionalDatetimeSchema,
  optionalNumericString,
  parseFormObject,
  requiredDatetimeSchema,
  storyGraphSchema,
} from "../../../../schemas";
import type { RequestEvent } from "./$types";

const saveSchema = z.object({
  stars: optionalNumericString(z.number().min(0).max(5).optional()).optional(),
  comment: z.string().optional(),
  dateStarted: requiredDatetimeSchema,
  dateFinished: optionalDatetimeSchema.nullish(),
  graphs: storyGraphSchema.nullish(),
  status: z.enum(READING_STATUS_VALUES_TUPLE),
  bookId: z.string(),
});

export async function POST(req: RequestEvent) {
  const accountId = await checkBookAuth(req.locals, req.params);

  const f = await req.request.formData();
  console.log("Form data received:", f);
  const formData = Object.fromEntries(f);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["dateStarted"] = parseFormObject(formData, "dateStarted");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["dateFinished"] = parseFormObject(formData, "dateFinished");

  // only add graphs if they are present
  if (f.has("graphs")) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    formData["graphs"] = parseFormObject(formData, "graphs");
  }

  console.log("to be checked formData: ", formData);

  const result = saveSchema.safeParse(formData);
  if (!result.success) {
    console.error("Validation failed:", result.error);
    return json(
      { success: false, error: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { bookId, stars, status, dateStarted, dateFinished, graphs, comment } =
    result.data;

  try {
    const createdDateStarted = await prisma.optionalDatetime.create({
      data: dateStarted,
    });

    let createdDateFinished;
    if (dateFinished) {
      createdDateFinished = await prisma.optionalDatetime.create({
        data: dateFinished,
      });
    }

    const readingActivity = await prisma.readingActivity.create({
      data: {
        accountId,
        bookId,
        status,
        dateStartedId: createdDateStarted.id,
        dateFinishedId: createdDateFinished?.id,
        rating:
          stars !== undefined
            ? {
                create: {
                  stars: stars,
                  comment: comment,
                },
              }
            : undefined,
      },
    });
    if (!readingActivity) {
      return json({ success: false });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error updating reading activity:", error);
    return json({ success: false });
  }
}
