// private server-only config using private environment variables

import { env } from "$env/dynamic/private";
import path from "path";
import { UPLOADS } from "../config/public";
import { createEnvReader, nonEmpty, parseBool } from "../config/utils";

const envReader = createEnvReader(env);

const insideDocker = envReader.required("INSIDE_DOCKER", parseBool);

const UPLOADS_PATH = insideDocker ? `/${UPLOADS}` : `static/${UPLOADS}/`;
const UPLOADS_IMAGES_PATH = path.join(UPLOADS_PATH, "images/");
console.log(`Uploads path: ${UPLOADS_PATH}`);

export const privateConfig = {
    booksApiKey: envReader.value("BOOKS_API_KEY", nonEmpty, { warn: true }),
    cachingEnabled: envReader.value("IMAGE_CACHING_ENABLED", parseBool, {
        fallback: false,
        warn: true,
    }),
    uploadsPath: UPLOADS_PATH,
    imagesPath: UPLOADS_IMAGES_PATH,
    insideDocker,
};

export function validatePrivateConfig() {
    const _c = privateConfig;
}
