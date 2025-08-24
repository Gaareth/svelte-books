import { json } from "@sveltejs/kit";
import z from "zod";

import { authorize } from "../../../../auth";
import {
  numericString,
  optionalDatetimeSchema,
  parseFormObject,
  storyGraphSchema,
} from "../../../../schemas";

import type { RequestEvent } from "./$types";

import { READING_STATUS, READING_STATUS_VALUES_TUPLE } from "$appTypes";
import { prisma } from "$lib/server/prisma";

const saveSchema = z
  .object({
    id: z.coerce.number(),
    stars: numericString(z.number().min(0).max(5).nullish()),
    comment: z.string().optional(),
    dateStarted: optionalDatetimeSchema.nullish(),
    dateFinished: optionalDatetimeSchema.nullish(),
    graphs: storyGraphSchema.nullish(),
    status: z.enum(READING_STATUS_VALUES_TUPLE).optional(),
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
  const { requestedAccount } = await authorize(await req.locals.auth());
  const accountId = requestedAccount.id;

  const f = await req.request.formData();
  const formData = Object.fromEntries(f);
  console.log("Form data received:", formData);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["dateStarted"] = parseFormObject(formData, "dateStarted");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["dateFinished"] = parseFormObject(formData, "dateFinished");

  // only add graphs if they are present
  // if (f.has("graphs")) {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   formData["graphs"] = parseFormObject(formData, "graphs");
  // }

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

  const { id, stars, status, dateStarted, dateFinished, graphs, comment } =
    result.data;

  console.log("Parsed data:", {
    id,
    stars,
    status,
    dateStarted,
    dateFinished,
    graphs,
    comment,
  });
  try {
    // only delete if exist
    if (dateFinished == null || dateStarted == null) {
      const currentEntry = await prisma.readingActivity.findUnique({
        where: { id },
      });

      if (currentEntry?.dateStartedId != null && dateStarted == null) {
        await prisma.readingActivity.update({
          where: { id, accountId },
          data: {
            dateStarted: { delete: true },
          },
        });
      }

      if (currentEntry?.dateFinishedId != null && dateFinished == null) {
        await prisma.readingActivity.update({
          where: { id, accountId },
          data: {
            dateFinished: { delete: true },
          },
        });
      }
    }

    const readingActivity = await prisma.readingActivity.update({
      where: {
        id: id,
        accountId,
      },
      data: {
        status: {
          update: {
            status,
          },
        },
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
