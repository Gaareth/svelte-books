// src/lib/config/public.ts
import { env } from "$env/dynamic/public";
import { createEnvReader, parseBool, parseCommaSeparatedList } from "./utils";

const envReader = createEnvReader(env);
export const UPLOADS = "uploads";

export const publicConfig = {
    imageUploads: {
        urlPrefix: `${UPLOADS}/images/`,
        enabled: envReader.value("PUBLIC_ALLOW_UPLOADS", parseBool, {
            fallback: false,
        }),
        maxFileSize: envReader.value(
            "PUBLIC_MAX_IMAGE_UPLOAD_SIZE_BYTES",
            parseInt,
            { fallback: 5 * 1024 * 1024 },
        ),
        allowedTypes: envReader.value(
            "PUBLIC_ALLOWED_IMAGE_TYPES",
            parseCommaSeparatedList,
            { fallback: ["jpeg", "png", "webp", "avif"] },
        ),
    },
} as const;
