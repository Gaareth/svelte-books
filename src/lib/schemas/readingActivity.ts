import {
  READING_ACTIVITY_TYPES,
  type ReadingActivityStatusType,
} from "$lib/constants/enums";
import z from "zod";
import {
  optionalDatetimeSchema,
  ownershipSchema,
  storyGraphSchema,
} from "./schemas";
import { numericString, optionalNumericString } from "./utils";

const baseSchema = {
  comment: z.string().optional(),
  dateStarted: optionalDatetimeSchema.nullish(),
  dateFinished: optionalDatetimeSchema.nullish(),
  graphs: storyGraphSchema.nullish().optional(),
};

const requireStartDate = (
  data: { status?: ReadingActivityStatusType; dateStarted?: unknown },
  ctx: z.RefinementCtx
) => {
  if (
    data.status !== READING_ACTIVITY_TYPES.TO_READ &&
    data.status !== READING_ACTIVITY_TYPES.ACQUIRED &&
    !data.dateStarted
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "A start date is required unless status is 'to read' or 'acquired'",
      path: ["dateStarted"],
    });
  }
};

const requireOwnership = (
  data: { status?: ReadingActivityStatusType; dateStarted?: unknown },
  ctx: z.RefinementCtx
) => {
  if (data.status === READING_ACTIVITY_TYPES.ACQUIRED) {
    const result = ownershipSchema.safeParse(data); // parses the full ownership, not just ownerShipSchema.partial()

    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue(issue);
      }
    }
  }
};

export const createSchema = z
  .object({
    ...baseSchema,
    stars: optionalNumericString(
      z.number().min(0).max(5).optional()
    ).optional(),
    status: z.nativeEnum(READING_ACTIVITY_TYPES),
    bookId: z.string(),
  })
  .merge(ownershipSchema.partial())
  .superRefine(requireOwnership)
  .superRefine(requireStartDate);

export const updateSchema = z
  .object({
    ...baseSchema,
    id: z.coerce.number(),
    stars: numericString(z.number().min(0).max(5).nullish()),
    status: z.nativeEnum(READING_ACTIVITY_TYPES).optional(),
  })
  .merge(ownershipSchema.partial())
  .superRefine(requireOwnership)
  .superRefine(requireStartDate);
