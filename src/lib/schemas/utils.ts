import z, { ZodIssueCode } from "zod";

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

export const parseJsonPreprocessor = (value: unknown, ctx: z.RefinementCtx) => {
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
