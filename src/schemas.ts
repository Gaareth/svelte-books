import { z, ZodIssueCode } from "zod";

export const numericString = (schema: z.ZodTypeAny) =>
  z.preprocess((a) => {
    if (typeof a === "string") {
      const n = parseInt(a, 10);
      if (isNaN(n)) {
        return null;
      }
      return n;
    } else if (typeof a === "number") {
      return a;
    } else {
      return null;
    }
  }, schema) as z.ZodEffects<z.ZodTypeAny, number, number>;

export const optionalNumericString = (schema: z.ZodTypeAny) =>
  z.preprocess((a) => {
    if (typeof a === "string") {
      if (a === "") return undefined;
      const n = parseInt(a, 10);
      if (isNaN(n)) {
        return undefined;
      }
      return n;
    } else if (typeof a === "number") {
      return a;
    } else {
      return undefined;
    }
  }, schema) as z.ZodEffects<z.ZodTypeAny, number, number>;

export const parseJsonPreprocessor = (value: any, ctx: z.RefinementCtx) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (e) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: (e as Error).message,
      });
    }
  }

  return value;
};

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

  timezone: z.coerce.number().min(0).nullish(), // Optional timezoneoffset in minutes
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

type NestedObject = { [key: string]: any };
// date[time][hour] => {date: {time: {hour: value}}}
function buildObject(keys: string[], value: any): NestedObject {
  return keys
    .reverse()
    .reduce((acc: NestedObject, key: string, index: number) => {
      if (index === 0) {
        return { [key]: value }; // Add the value at the deepest level
      }
      return { [key]: acc }; // Build the nested structure for the other keys
    }, {});
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown) {
  return item && typeof item === "object" && !Array.isArray(item);
}

// TODO: test infinite recursion
/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function mergeDeep(
  target: NestedObject,
  maxDepth = 10,
  depth = 0,
  ...sources: NestedObject[]
) {
  if (depth >= maxDepth) {
    throw Error("Max Recursion reached while deep merging");
  }

  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], maxDepth, depth + 1, source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, maxDepth, depth + 1, ...sources);
}
export function parseFormObject(
  formData: { [k: string]: FormDataEntryValue },
  attribute: string
) {
  let object = {};

  const regexObject = /([a-zA-Z]+)(\[[a-zA-Z]+\])+/;
  const regexKeys = /\[([a-zA-Z]+)\]/g; // Matches any word inside square brackets

  for (const [key, value] of Object.entries(formData)) {
    const match = key.match(regexObject);

    if (match && attribute == match[1]) {
      // console.log(key, value);

      const matches = [...key.matchAll(regexKeys)].map((m) => m[1]);

      // console.log(matches);

      // const l = buildObject(matches, value);

      // console.log("merging", object, "and", l);
      object = { ...object, ...buildObject(matches, value) };

      // object = mergeDeep({ object }, 10, 0, l);
      // console.log(object);
    }
  }

  return object;
}

export function parseFormArray(
  formData: { [k: string]: FormDataEntryValue },
  attribute: string
) {
  const values = [];
  const regexObject = /([a-zA-Z]+)\[(.*)\]+/;

  for (const [key, value] of Object.entries(formData)) {
    const match = key.match(regexObject);

    if (match && attribute == match[1]) {
      // console.log(match);

      if (match[2].length == 0) {
        values.push(value);
      } else {
        values.push([match[2], value]);
      }
    }
  }

  return values;
}
