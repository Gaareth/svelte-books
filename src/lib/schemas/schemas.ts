import z from "zod";

import { numericString, parseJsonPreprocessor } from "./utils";

import { BookOwnership } from "$prismaBrowser";
import type { Metadata } from "sharp";
import sharp from "sharp";

export function createFileUploadSchema(
    allowedTypes: string[],
    maxFileSize: number,
) {
    return z
        .instanceof(File)
        .refine((file) => file.size <= 0, "File is empty")

        .refine(
            (file) => file.size <= maxFileSize,
            `File is too large. Maximum size is ${maxFileSize} bytes.`,
        )
        .refine(
            (file) => allowedTypes.includes(file.type),
            `Unsupported file type. Allowed types: ${allowedTypes.join(", ")}`,
        );
}

export type ImageTypes =
    | "jpeg"
    | "png"
    | "webp"
    | "avif"
    | "svg+xml"
    | "gif"
    | "apng"
    | "tiff"
    | "bmp"
    | "ico";
export function createImageUploadSchema(
    allowedTypes: ImageTypes[],
    maxFileSize: number,
) {
    // to prevent enormous images after decoding?
    const MAX_PIXELS = 25_000_000;

    return createFileUploadSchema(
        allowedTypes.map((t) => `image/${t}`),
        maxFileSize,
    )
        .transform(async (file) => {
            const image = sharp(await file.arrayBuffer());
            return { file, image };
        })
        .superRefine(async (data, ctx) => {
            let metadata: Metadata;
            try {
                metadata = await data.image.metadata();
            } catch {
                ctx.addIssue({
                    code: "custom",
                    message:
                        "Failed to read image metadata. The file may not be a valid image.",
                });
                return;
            }

            if (!(allowedTypes as string[]).includes(metadata.format ?? "")) {
                ctx.addIssue({
                    code: "custom",
                    message: `Unsupported image format ${metadata.format ?? "unknown"}. Allowed formats: ${allowedTypes.join(",")}.`,
                });
            }

            if (metadata.width === undefined || metadata.height === undefined) {
                ctx.addIssue({
                    code: "custom",
                    message: "Could not determine image dimensions",
                });
                return;
            }

            const pixelCount = metadata.width * metadata.height;
            if (pixelCount > MAX_PIXELS) {
                ctx.addIssue({
                    code: "custom",
                    message: `Image has too many pixels (${pixelCount}). Maximum allowed is ${MAX_PIXELS}.`,
                });
            }
        });
}

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
    },
);

export const optionalDatetimeSchema = DatetimeSchema.transform((data) =>
    data.year === null ? null : data,
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
        z.nativeEnum(BookOwnership).optional().nullable(),
    ),
    acquiredAtDate: optionalDatetimeSchema.optional(), // but needed when creating book, as this means multiple reading actvities. cant reused dateStarted
    ...ownershipBase,
});
