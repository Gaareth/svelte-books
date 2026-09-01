import {
    extractIdFromGoogleBooksUrl,
    normalizeGoogleBooksUrl,
} from "$src/lib/utils/googleApiUtils";
import type { Sharp } from "sharp";
import { cacheImage, fetchImage, type ImgVariantCaches } from "./images";

export async function findGoogleBookImageVariants(id: string) {
    const imgsByResolution: Record<number, Sharp> = {};

    for (let zoom = 1; zoom <= 10; zoom++) {
        const image = await fetchImage(normalizeGoogleBooksUrl(id, zoom));
        const metadata = await image.metadata();
        const resolution = metadata.width;
        imgsByResolution[resolution] = image;
    }

    const bestResolution = Math.max(
        ...Object.keys(imgsByResolution).map(Number),
    );
    const bestImage = imgsByResolution[bestResolution];
    return { imgsByResolution, bestImage, bestResolution };
}

export async function cacheGoogleBooksImageID(
    id: string,
): Promise<ImgVariantCaches> {
    const { bestImage } = await findGoogleBookImageVariants(id);
    return await cacheImage(bestImage, id);
}

export async function cacheGoogleBooksImageURL(
    url: string,
): Promise<ImgVariantCaches> {
    const image = await fetchImage(url);
    const id = extractIdFromGoogleBooksUrl(url) ?? "unknown-google-book-id";
    return await cacheImage(image, "google-books-image-" + id);
}
