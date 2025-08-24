import { json } from "@sveltejs/kit";
import z from "zod";

import {
  optionalDatetimeSchema,
  optionalNumericString,
  parseFormObject,
  storyGraphSchema,
} from "../../../../schemas";
import { createReadingActivity } from "../api.server";

import type { RequestEvent } from "./$types";

import { READING_STATUS } from "$appTypes";
import { authorize } from "../../../../auth";

const saveSchema = z
  .object({
    stars: optionalNumericString(
      z.number().min(0).max(5).optional()
    ).optional(),
    comment: z.string().optional(),
    dateStarted: optionalDatetimeSchema.nullish(),
    dateFinished: optionalDatetimeSchema.nullish(),
    graphs: storyGraphSchema.nullish(),
    status: z.nativeEnum(READING_STATUS),
    bookId: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.status !== READING_STATUS.TO_READ && !data.dateStarted) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A start date is required unless status is 'to read'",
        path: ["dateStarted"],
      });
    }
  });

export async function POST(req: RequestEvent) {
  const accountId = (await authorize(await req.locals.auth())).requestedAccount
    .id;

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
    const readingActivity = await createReadingActivity(
      accountId,
      bookId,
      stars,
      status,
      dateStarted,
      dateFinished,
      graphs,
      comment
    );

    return json({ success: readingActivity != null });
  } catch (error) {
    console.error("Error updating reading activity:", error);
    return json({ success: false });
  }
}
