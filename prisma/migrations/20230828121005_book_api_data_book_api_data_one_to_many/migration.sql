/*
  Warnings:

  - You are about to drop the column `bookId` on the `BookApiData` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookApiData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "isbn_13" TEXT,
    "pageCount" INTEGER NOT NULL,
    "publishedDate" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "language" TEXT NOT NULL
);
INSERT INTO "new_BookApiData" ("authors", "id", "isbn_13", "language", "pageCount", "publishedDate", "publisher", "subtitle", "thumbnailUrl", "title") SELECT "authors", "id", "isbn_13", "language", "pageCount", "publishedDate", "publisher", "subtitle", "thumbnailUrl", "title" FROM "BookApiData";
DROP TABLE "BookApiData";
ALTER TABLE "new_BookApiData" RENAME TO "BookApiData";
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverImage" TEXT,
    "monthRead" INTEGER,
    "yearRead" INTEGER,
    "bookListName" TEXT,
    "bookSeriesId" INTEGER,
    "bookApiDataId" TEXT,
    CONSTRAINT "Book_bookListName_fkey" FOREIGN KEY ("bookListName") REFERENCES "BookList" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookSeriesId_fkey" FOREIGN KEY ("bookSeriesId") REFERENCES "BookSeries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookApiDataId_fkey" FOREIGN KEY ("bookApiDataId") REFERENCES "BookApiData" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("author", "bookListName", "bookSeriesId", "coverImage", "createdAt", "id", "monthRead", "name", "updatedAt", "yearRead") SELECT "author", "bookListName", "bookSeriesId", "coverImage", "createdAt", "id", "monthRead", "name", "updatedAt", "yearRead" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_name_key" ON "Book"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
