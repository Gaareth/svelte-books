-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "path" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "placeholderHash" TEXT,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL
);
INSERT INTO "new_Image" ("createdAt", "height", "id", "path", "placeholderHash", "sourceUrl", "updatedAt", "width") SELECT "createdAt", "height", "id", "path", "placeholderHash", "sourceUrl", "updatedAt", "width" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE UNIQUE INDEX "Image_path_key" ON "Image"("path");
CREATE UNIQUE INDEX "Image_sourceUrl_key" ON "Image"("sourceUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
