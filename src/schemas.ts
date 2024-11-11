import { z, type ZodTypeAny } from "zod";

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

export const optionalDatetimeSchema = z
  .object({
    day: numericString(z.number().int().min(0).max(31).nullish()),
    month: numericString(z.number().int().min(0).max(12).nullish()),
    year: numericString(z.number().int().min(0).nullish()),

    hour: numericString(z.number().int().min(0).max(23).nullish()),
    minute: numericString(z.number().int().min(0).max(59).nullish()),

    timezone: z.coerce.number().min(0).nullish(), // Optional timezoneoffset in minutes
  })
  .transform((data) => (data.year === null ? null : data))
  .nullish();
