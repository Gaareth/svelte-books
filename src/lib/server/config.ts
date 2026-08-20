// private server-only config using private environment variables

import { env } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import path from "path";
import { createEnvReader, nonEmpty, parseBool } from "../config/utils";

const envReader = createEnvReader(env);
const publicEnvReader = createEnvReader(publicEnv);

const cachingEnabled = envReader.value("IMAGE_CACHING_ENABLED", parseBool, {
    fallback: false,
    warn: true,
});

export const privateConfig = {
    booksApiKey: envReader.required("BOOKS_API_KEY", nonEmpty),
    cachingEnabled,
    imagesFolder: publicEnvReader.requiredWhen(
        "PUBLIC_IMAGES_FOLDER",
        (value) => path.join("static", nonEmpty(value)),
        cachingEnabled,
    ),
};
