import { json } from "@sveltejs/kit";

import { authorize } from "$lib/auth/auth";

import type { RequestEvent } from "./$types";

import { prisma } from "$lib/server/prisma";

import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
import { updateSchema } from "$lib/schemas/readingActivity";
import { parseFormObject } from "$lib/schemas/utils";

export async function POST(req: RequestEvent) {
  const { requestedAccount } = await authorize(await req.locals.auth());
  const accountId = requestedAccount.id;

  const f = await req.request.formData();
  const formData = Object.fromEntries(f);
  // console.log("Form data received:", formData);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["dateStarted"] = parseFormObject(formData, "dateStarted");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["dateFinished"] = parseFormObject(formData, "dateFinished");

  // only add graphs if they are present
  // if (f.has("graphs")) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // formData["graphs"] = parseFormObject(formData, "graphs");
  // }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  formData["graphs"] = parseFormObject(formData, "graphs");

  const result = updateSchema.safeParse(formData);
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
        status: status
          ? {
              connectOrCreate: {
                where: {
                  status_accountId: {
                    status,
                    accountId,
                  },
                },
                create: {
                  status,
                  accountId,
                },
              },
            }
          : undefined,
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

    if (status === READING_ACTIVITY_TYPES.ACQUIRED) {
      const { location, bookOwnership } = result.data;
      const ownership = await prisma.ownership.update({
        where: {
          bookId: readingActivity.bookId,
        },
        data: {
          location,
          status: bookOwnership,
          acquiredAtId: readingActivity?.dateStartedId,
        },
      });

      if (!ownership) {
        return json({ success: false }, { status: 500 });
      }
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
