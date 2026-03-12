import { json } from "@sveltejs/kit";

import { authorize } from "$lib/auth/auth";

import { createReadingActivity } from "../api.server";

import type { RequestEvent } from "./$types";

import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
import { createSchema } from "$lib/schemas/readingActivity";
import { parseFormObject } from "$lib/schemas/utils";
import { prisma } from "$lib/server/prisma";

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

  // console.log(formData);

  // if (formData["graphs"] !== undefined) {
  // @ts-ignore
  formData["graphs"] = parseFormObject(formData, "graphs");
  // }
  // console.log(formData);

  const result = createSchema.safeParse(formData);
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

    if (status === READING_ACTIVITY_TYPES.ACQUIRED) {
      const { location, bookOwnership } = result.data;
      const ownership = await prisma.ownership.create({
        data: {
          bookId,
          location,
          status: bookOwnership,
          acquiredAtId: readingActivity?.dateStartedId,
        },
      });

      if (!ownership) {
        return json({ success: false }, { status: 500 });
      }
    }

    return json({ success: readingActivity != null });
  } catch (error) {
    console.error("Error updating reading activity:", error);
    return json({ success: false });
  }
}
