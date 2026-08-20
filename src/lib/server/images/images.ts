import { Prisma } from "$prismaClient";
import { prisma } from "$src/lib/server/prisma";
import { unlink } from "node:fs/promises";
import path from "node:path";
import sharp, { type Sharp } from "sharp";
import { rgbaToThumbHash } from "thumbhash";
import { v4 as uuidv4 } from "uuid";
import { privateConfig } from "../config";

export type ImageWithVariants = Prisma.ImageGetPayload<{
    include: {
        variants: true;
    };
}>;

const IMAGE_VARIANTS_WIDTHS = [128, 192, 256, 320, 480, 640, 768, 1024];
const OUTPUT_DIR = privateConfig.imagesFolder;

export async function fetchImage(url: string): Promise<Sharp> {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const image = sharp(buffer);
    return image;
}

export async function thumbhashImage(image: Sharp): Promise<string> {
    const { data, info } = await image
        .resize({
            width: 100,
            height: 100,
            fit: "inside",
            withoutEnlargement: true,
        })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const hashBytes = rgbaToThumbHash(info.width, info.height, data);
    const hashString = Buffer.from(hashBytes).toString("base64");
    return hashString;
}

export type ImgVariantCaches = {
    primaryImg: {
        path: string;
        width: number;
        height: number;
    };
    imageVariants: { path: string; width: number }[];
    placeholderHash: string;
};

export async function cacheImageFile(file: File): Promise<ImgVariantCaches> {
    const image = sharp(await file.arrayBuffer());
    const id = `upload-${uuidv4()}`;
    return await cacheImage(image, id);
}

export async function cacheUploadedImage(
    image: Sharp,
): Promise<ImgVariantCaches> {
    const id = `upload-${uuidv4()}`;
    return await cacheImage(image, id);
}

export async function cacheImage(
    image: Sharp,
    id: string,
): Promise<ImgVariantCaches> {
    const t1 = Date.now();

    const outputDir = OUTPUT_DIR;
    if (!outputDir) {
        throw new Error("IMAGES_FOLDER environment variable is not set");
    }

    const primaryImgOutputPath = path.join(outputDir, `${id}-primary.webp`);
    await image.toFormat("webp").toFile(primaryImgOutputPath);
    const primaryImgMetadata = await image.metadata();

    const widths = IMAGE_VARIANTS_WIDTHS.filter(
        (width) => width < primaryImgMetadata.width,
    );

    const variantPromises = widths.map(async (width) => {
        const imgPath = path.join(outputDir, `${id}-${width}w.webp`);

        await image
            .clone()
            .resize({
                width,
                withoutEnlargement: true,
            })
            .webp()
            .toFile(imgPath);

        return {
            path: imgPath,
            width,
        };
    });

    const [_, imageVariants, placeholderHash] = await Promise.all([
        image.clone().webp().toFile(primaryImgOutputPath),
        Promise.all(variantPromises),
        thumbhashImage(image.clone()),
    ]);

    console.log(`Cached image ${id} in ${Date.now() - t1}ms`);

    return {
        primaryImg: {
            path: primaryImgOutputPath,
            width: primaryImgMetadata.width,
            height: primaryImgMetadata.height,
        },
        imageVariants,
        placeholderHash,
    };
}

export async function saveCachesToDB(
    caches: ImgVariantCaches,
    sourceUrl?: string,
) {
    if (!privateConfig.imagesFolder) {
        throw new Error("IMAGES_FOLDER environment variable is not set");
    }

    // to not depend on the path of the images folder, we store the relative path in the database
    // static/uploads/primary.webp -> primary.webp
    const makeRelativePath = (inpath: string) =>
        path.relative(privateConfig.imagesFolder!, inpath);

    const { primaryImg, imageVariants, placeholderHash } = caches;
    const primaryImage = await prisma.image.create({
        data: {
            path: makeRelativePath(primaryImg.path),
            width: primaryImg.width,
            height: primaryImg.height,
            sourceUrl,
            placeholderHash,
            variants: {
                create: imageVariants.map((variant) => ({
                    path: makeRelativePath(variant.path),
                    width: variant.width,
                })),
            },
        },
    });

    return primaryImage;
}

export async function deleteCachedImage(image: ImageWithVariants) {
    const makeFullPath = (inpath: string) =>
        path.join(privateConfig.imagesFolder!, inpath);

    await unlink(makeFullPath(image.path));
    for (const variant of image.variants) {
        await unlink(makeFullPath(variant.path));
    }

    await prisma.image.delete({
        where: { id: image.id },
    });
}

export function generateSrcSet(
    variants: { path: string; width: number }[],
): string {
    return variants.map((img) => `${img.path} ${img.width}w`).join(",");
}

export function generateSrcSetFromDB(image: ImageWithVariants): string {
    return generateSrcSet(image.variants);
}

export function generateNewSrcSet(caches: ImgVariantCaches): string {
    return generateSrcSet(
        caches.imageVariants.map((img) => ({
            path: img.path,
            width: img.width,
        })),
    );
}
