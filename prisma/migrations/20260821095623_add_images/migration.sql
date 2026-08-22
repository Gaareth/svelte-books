/*
  Warnings:

  - You are about to drop the column `coverImage` on the `Book` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "path" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "placeholderHash" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ImageVariant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "width" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "primaryImageId" INTEGER NOT NULL,
    CONSTRAINT "ImageVariant_primaryImageId_fkey" FOREIGN KEY ("primaryImageId") REFERENCES "Image" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverImageId" INTEGER,
    "bookListId" INTEGER,
    "bookSeriesId" INTEGER,
    "bookApiDataId" TEXT,
    "wordsPerPage" INTEGER,
    "accountId" TEXT NOT NULL,
    "recommendedBy" TEXT,
    "description" TEXT,
    CONSTRAINT "Book_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Image" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookListId_fkey" FOREIGN KEY ("bookListId") REFERENCES "BookList" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookSeriesId_fkey" FOREIGN KEY ("bookSeriesId") REFERENCES "BookSeries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookApiDataId_fkey" FOREIGN KEY ("bookApiDataId") REFERENCES "BookApiData" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("accountId", "author", "bookApiDataId", "bookListId", "bookSeriesId", "createdAt", "description", "id", "name", "recommendedBy", "updatedAt", "wordsPerPage") SELECT "accountId", "author", "bookApiDataId", "bookListId", "bookSeriesId", "createdAt", "description", "id", "name", "recommendedBy", "updatedAt", "wordsPerPage" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Image_path_key" ON "Image"("path");

-- CreateIndex
CREATE UNIQUE INDEX "Image_sourceUrl_key" ON "Image"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ImageVariant_primaryImageId_width_key" ON "ImageVariant"("primaryImageId", "width");
