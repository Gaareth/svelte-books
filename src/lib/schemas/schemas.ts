import { BookOwnership } from "$prismaBrowser";
import z from "zod";
import { numericString, parseJsonPreprocessor } from "./utils";

export const storyGraphSchema = z.object({
  title: z.string(),
  labels: z.preprocess(parseJsonPreprocessor, z.string().array()),
  details: z.preprocess(parseJsonPreprocessor, z.string().array()),
  data: z.preprocess(parseJsonPreprocessor, z.number().nullable().array()),
});

export const DatetimeSchema = z.object({
  day: numericString(z.number().int().min(0).max(31).nullish()),
  month: numericString(z.number().int().min(0).max(12).nullish()),
  year: numericString(z.number().int().min(0).nullish()),

  hour: numericString(z.number().int().min(0).max(23).nullish()),
  minute: numericString(z.number().int().min(0).max(59).nullish()),

  timezoneOffset: numericString(z.number().int().min(0).max(31).nullish()), // Optional timezoneoffset in minutes
});

export const requiredDatetimeSchema = DatetimeSchema.refine(
  (data) => data.year !== null,
  {
    message: "Year is required",
    path: ["year"],
  }
);

export const optionalDatetimeSchema = DatetimeSchema.transform((data) =>
  data.year === null ? null : data
);

// Empty -> null -> gets deleted
const emptyStringToNull = (val: unknown) => (val === "" ? null : val);

const ownershipBase = {
  location: z.string().trim().optional().nullable(),
  // acquiredAtDate: optionalDatetimeSchema.optional(), // is stored inside dateStarted of reading activity, so not needed here
};

export const ownershipSchema = z.object({
  bookOwnership: z.nativeEnum(BookOwnership, {
    message: "Please select an ownership option",
  }),
  ...ownershipBase,
});

export const createOwnershipSchema = z.object({
  bookOwnership: z.preprocess(
    emptyStringToNull,
    z.nativeEnum(BookOwnership).optional().nullable()
  ),
  acquiredAtDate: optionalDatetimeSchema.optional(), // but needed when creating book, as this means multiple reading actvities. cant reused dateStarted
  ...ownershipBase,
});
