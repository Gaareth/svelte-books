import { privateConfig } from "$lib/server/config";
import { prisma } from "$lib/server/prisma";
import fs from "node:fs/promises";
import path from "node:path";

async function cleanupCachedImages() {
    const maxCacheSizeBytes = privateConfig.imageCaching.maxCacheSizeBytes;
    const cachePath = privateConfig.imageCaching.path;

    const entries = await fs.readdir(cachePath, {
        withFileTypes: true,
    });

    const files = [];
    for (const entry of entries) {
        if (!entry.isFile()) continue;

        const filepath = path.join(cachePath, entry.name);
        const { size, mtime } = await fs.stat(filepath);
        files.push({ filepath, size, mtime });
    }

    // Sort files by last modified time (latest to oldest)
    // keep all files until the total size exceeds maxCacheSizeBytes, then delete the rest
    files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    let runningTotalSize = 0;
    for (const file of files) {
        if (runningTotalSize + file.size > maxCacheSizeBytes) {
            await fs.unlink(file.filepath);
            continue;
        }

        runningTotalSize += file.size;
    }

    console.log(
        `Cleanup complete. Total cache size: ${runningTotalSize} bytes.`,
    );
}

async function cleanupOldCachedImages() {
    // Get all cached images from the database
    const cachedImages = await prisma.image.findMany({
        where: {
            books: {
                none: {}, // No associated books
            },
        },
    });

    for (const image of cachedImages) {
        const fsPath = path.join(privateConfig.imageCaching.path, image.path);
        const isExpired =
            Date.now() - image.updatedAt.getTime() >
            privateConfig.imageCaching.maxAgeMs;
        const isMissing = await fs.stat(fsPath).catch(() => false);

        if (isExpired) {
            await fs.unlink(fsPath);
            console.log(`Deleted expired cached image: ${fsPath}`);
        }

        if (isMissing) {
            await prisma.image.delete({
                where: { id: image.id },
            });
            console.log(
                `Deleted database entry for missing cached image: ${fsPath}`,
            );
        }
    }
}

async function cleanupImages() {
    await cleanupCachedImages();
    await cleanupOldCachedImages();
}

export async function runCacheCleanupScheduler() {
    setInterval(async () => {
        try {
            await cleanupImages();
        } catch (error) {
            console.error("Error during cache cleanup:", error);
        }
    }, privateConfig.imageCaching.cleanupIntervalMs);
}
