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

export function normalizeGoogleBooksUrl(id: string, zoom: number = 1): string {
    return `https://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=${zoom}&source=gbs_api`;
}

export async function cacheGoogleBooksImage(
    id: string,
): Promise<ImgVariantCaches> {
    const { bestImage } = await findGoogleBookImageVariants(id);
    return await cacheImage(bestImage, id);
}
