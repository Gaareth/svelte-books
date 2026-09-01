// private server-only config using private environment variables

import { env } from "$env/dynamic/private";
import path from "path";
import { UPLOADS } from "../config/public";
import {
    createEnvReader,
    nonEmpty,
    parseBool,
    parseDuration,
    parseSize,
} from "../config/utils";

const envReader = createEnvReader(env);

const insideDocker = envReader.value("INSIDE_DOCKER", parseBool, {
    fallback: false,
});

const UPLOADS_PATH = insideDocker ? `/${UPLOADS}` : `static/${UPLOADS}/`;
const UPLOADS_IMAGES_PATH = path.join(UPLOADS_PATH, "images/");

const CACHED_IMAGES_PATH = path.join(UPLOADS_IMAGES_PATH, "cached/");

export const privateConfig = {
    booksApiKey: envReader.value("BOOKS_API_KEY", nonEmpty, { warn: true }),
    imageCaching: {
        path: CACHED_IMAGES_PATH,
        enabled: envReader.value("IMAGE_CACHING_ENABLED", parseBool, {
            fallback: false,
            warn: true,
        }),
        maxAge: envReader.value("IMAGE_CACHING_MAX_AGE", parseDuration, {
            fallback: 60 * 60 * 1000, // 1 hour in milliseconds
            warn: true,
        }),
        maxCacheSize: envReader.value(
            "IMAGE_CACHING_MAX_CACHE_SIZE",
            parseSize,
            {
                fallback: 500 * 1024 * 1024, // 500 MB in bytes
                warn: true,
            },
        ),
    },
    uploadsPath: UPLOADS_PATH,
    imagesPath: UPLOADS_IMAGES_PATH,
    insideDocker,
};

export function validatePrivateConfig() {
    const _c = privateConfig;
}
