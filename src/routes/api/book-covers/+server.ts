import { error, type RequestHandler } from "@sveltejs/kit";

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

    //TODO: add caching

    // todo: maybe add api key
    // console.log("Fetching image from Google Books:", imageUrl);
    const response = await fetch(urlObject);

    return new Response(response.body, {
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
