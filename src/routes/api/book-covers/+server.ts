import { privateConfig } from "$src/lib/server/config";
import { cacheSingleImageFromStream } from "$src/lib/server/images/images";
import { prisma } from "$src/lib/server/prisma";
import { error, type RequestHandler } from "@sveltejs/kit";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";

export const GET: RequestHandler = async ({ url }) => {
    const imageUrl = url.searchParams.get("url");
    if (!imageUrl) {
        error(400, "Missing 'url' query parameter.");
    }

    const urlObject: URL = new URL(imageUrl);
    const hostname = urlObject.hostname;

    if (hostname !== "books.google.com") {
        error(
            400,
            "Invalid URL. Only Google Books URLs are currently supported.",
        );
    }

    // delete tracking param
    const normalizedUrlObject = new URL(urlObject);
    normalizedUrlObject.searchParams.delete("imgtk");

    const normalizedUrl = normalizedUrlObject.toString();

    if (privateConfig.imageCaching.enabled) {
        const cachedImage = await prisma.image.findUnique({
            where: {
                sourceUrl: normalizedUrl,
            },
        });

        if (cachedImage) {
            const stream = createReadStream(cachedImage.path);

            try {
                await new Promise<void>((resolve, reject) => {
                    stream.once("open", () => resolve());
                    stream.once("error", reject);
                });

                return new Response(Readable.toWeb(stream) as ReadableStream, {
                    headers: {
                        "Content-Type": "image/webp",
                    },
                });
            } catch {
                stream.destroy();
                // Cached file is missing → continue and fetch the original
            }
        }
    }

    // todo: maybe add api key
    const response = await fetch(normalizedUrl);

    if (!response.body) {
        return new Response("Failed to fetch image", { status: 502 });
    }

    let clientStream = response.body;
    if (privateConfig.imageCaching.enabled && response.body) {
        const [clientStreamTeed, cacheStream] = response.body.tee();
        clientStream = clientStreamTeed;

        // Cache in the background; don't wait for it.
        void cacheSingleImageFromStream(cacheStream, response.url);
    }

    return new Response(clientStream, {
        headers: {
            "Content-Type": response.headers.get("content-type") ?? "image/png",
        },
    });
};

// export const POST: RequestHandler = async ({ request }) => {
//     const { url } = await request.json();

//     const urlObject: URL = new URL(url);
//     const baseUrl = urlObject.origin;

//     if (baseUrl !== "https://books.google.com") {
//         error(400, "Invalid URL. Only Google Books URLs are allowed.");
//     }

//     const googleBookId = urlObject.searchParams.get("id");

//     if (!googleBookId) {
//         error(400, "Invalid URL. Missing 'id' parameter.");
//     }

//     if (env.IMAGES_FOLDER === undefined) {
//         console.warn(
//             "IMAGES_FOLDER environment variable is not set. Returning the original URL without caching.",
//         );
//         return json({
//             url,
//         });
//     }

//     const cachedImage = await prisma.image.findUnique({
//         where: {
//             sourceUrl: normalizeGoogleBooksUrl(googleBookId),
//         },
//         include: {
//             variants: true,
//         },
//     });

//     if (cachedImage) {
//         console.log("Using cached image for Google Book ID:", googleBookId);
//         return json({
//             url: cachedImage.url,
//             placeholderHash: cachedImage.placeholderHash,
//             srcset: generateSrcSetFromDB(cachedImage),
//         });
//     }

//     console.log("Caching new image for Google Book ID:", googleBookId);

//     const caches = await cacheGoogleBooksImage(googleBookId, env.IMAGES_FOLDER);
//     await saveCachesToDB(googleBookId, caches);
//     return json({
//         url: caches.primaryImg.url,
//         placeholderHash: caches.placeholderHash,
//         srcset: generateNewSrcSet(caches),
//     });
// };
