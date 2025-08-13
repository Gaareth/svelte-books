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
  const formData = Object.fromEntries(f);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["dateStarted"] = parseFormObject(formData, "dateStarted");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["dateFinished"] = parseFormObject(formData, "dateFinished");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["graphs"] = parseFormObject(formData, "graphs");

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

    // todo: extend for multiple
    if (graphs != null) {
      if (
        Array.isArray(graphs.data) &&
        graphs.data.some((value) => value != null)
      ) {
        // at least one value is present, so create the graph
        await prisma.graph.create({
          data: {
            data: JSON.stringify(graphs.data),
            labels: JSON.stringify(graphs.labels),
            details: JSON.stringify(graphs.details),
            title: graphs.title,
            readingActivityId: readingActivity.id,
          },
        });
      }
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error updating reading activity:", error);
    return json({ success: false });
  }
}
