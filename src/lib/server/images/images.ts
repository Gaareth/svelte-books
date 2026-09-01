import { Prisma } from "$prismaClient";
import { prisma } from "$src/lib/server/prisma";
import { createHash } from "node:crypto";
import fs, { unlink } from "node:fs/promises";
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
const OUTPUT_PATH = privateConfig.imagesPath;

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

// to provide cache busting filenames
async function saveImageWithHash(
    image: Sharp,
    filename: string,
    extension: string = "webp",
): Promise<string> {
    const buffer = await image.toBuffer();
    const imageHash = createHash("sha256")
        .update(buffer)
        .digest("hex")
        .slice(0, 16);

    const { dir, name } = path.parse(filename);
    const hashedFilename = path.join(
        dir,
        `${name}-${imageHash}sha256.${extension}`,
    );

    // await image.toFile(hashedFilename);
    await fs.mkdir(path.dirname(hashedFilename), { recursive: true });
    await fs.writeFile(hashedFilename, buffer);
    return hashedFilename;
}

export async function cacheImage(
    image: Sharp,
    id: string,
): Promise<ImgVariantCaches> {
    const t1 = Date.now();

    const outputDir = OUTPUT_PATH;

    const primaryImgMetadata = await image.metadata();

    const widths = IMAGE_VARIANTS_WIDTHS.filter(
        (width) => width < primaryImgMetadata.width,
    );

    const variantPromises = widths.map(async (width) => {
        const imageVariant = image
            .clone()
            .resize({
                width,
                withoutEnlargement: true,
            })
            .webp();
        const imgPath = await saveImageWithHash(
            imageVariant,
            path.join(outputDir, `${id}-${width}w`),
        );

        return {
            path: imgPath,
            width,
        };
    });

    const [primaryImgOutputPath, imageVariants, placeholderHash] =
        await Promise.all([
            saveImageWithHash(
                image.webp(),
                path.join(outputDir, `${id}-primary`),
            ),
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
    if (!OUTPUT_PATH) {
        throw new Error("IMAGES_FOLDER environment variable is not set");
    }

    const { primaryImg, imageVariants, placeholderHash } = caches;

    const variantData = imageVariants.map((variant) => ({
        path: fromFSPathToDBPath(variant.path),
        width: variant.width,
    }));

    const imageData = {
        path: fromFSPathToDBPath(primaryImg.path),
        width: primaryImg.width,
        height: primaryImg.height,
        sourceUrl,
        placeholderHash,
    };

    // if the image already exists in the database (based on sourceUrl), update it; otherwise, create a new record
    let primaryImage;

    if (sourceUrl) {
        primaryImage = await prisma.image.upsert({
            where: {
                sourceUrl: sourceUrl,
            },
            create: imageData,
            update: imageData,
        });
    } else {
        primaryImage = await prisma.image.create({
            data: imageData,
        });
    }

    // nested upsert is not supported in Prisma, so we have to do this in a separate loop
    for (const variant of variantData) {
        await prisma.imageVariant.upsert({
            where: {
                primaryImageId_width: {
                    primaryImageId: primaryImage.id,
                    width: variant.width,
                },
            },
            update: variant,
            create: { ...variant, primaryImageId: primaryImage.id },
        });
    }

    return primaryImage;
}

export async function deleteCachedImage(image: ImageWithVariants) {
    try {
        await unlink(fromDBPathToFSPath(image.path));
    } catch (error) {
        console.error(`Error deleting cached image: ${error}`);
    }
    for (const variant of image.variants) {
        try {
            await unlink(fromDBPathToFSPath(variant.path));
        } catch (error) {
            console.error(`Error deleting cached image variant: ${error}`);
        }
    }

    await prisma.image.delete({
        where: { id: image.id },
    });
}

export function fromFSPathToDBPath(fspath: string): string {
    // to not depend on the path of the images folder, we store the relative path in the database
    // static/uploads/primary.webp -> primary.webp
    return path.relative(OUTPUT_PATH, fspath);
}

export function fromDBPathToFSPath(dbpath: string): string {
    return path.join(OUTPUT_PATH, dbpath);
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
