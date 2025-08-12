import { READING_STATUS_VALUES_TUPLE } from "$appTypes";
import { prisma } from "$lib/server/prisma";
import { json } from "@sveltejs/kit";
import z from "zod";
import { checkBookAuth } from "../../../../auth";
import {
  optionalDatetimeSchema,
  parseFormObject,
  storyGraphSchema,
} from "../../../../schemas";
import type { RequestEvent } from "./$types";

const saveSchema = z.object({
  id: z.coerce.number(),
  stars: z.coerce.number().min(0).max(5).optional(),
  comment: z.string().optional(),
  dateStarted: optionalDatetimeSchema.nullish(),
  dateFinished: optionalDatetimeSchema.nullish(),
  graphs: storyGraphSchema.nullish(),
  status: z.enum(READING_STATUS_VALUES_TUPLE).optional(),
});

export async function POST(req: RequestEvent) {
  await checkBookAuth(req.locals, req.params);

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

  const { id, stars, status, dateStarted, dateFinished, graphs, comment } =
    result.data;

  try {
    const readingActivity = await prisma.readingActivity.update({
      where: {
        id: id,
      },
      data: {
        status,
        dateStarted: dateStarted
          ? {
              upsert: {
                update: dateStarted,
                create: dateStarted,
              },
            }
          : undefined,
        dateFinished: dateFinished
          ? {
              upsert: {
                update: dateFinished,
                create: dateFinished,
              },
            }
          : undefined,
        rating:
          stars !== undefined
            ? {
                upsert: {
                  update: { stars: stars, comment },
                  create: { stars: stars, comment },
                },
              }
            : undefined,
        storyGraphs: {
          deleteMany: {}, // delete all
        },
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
