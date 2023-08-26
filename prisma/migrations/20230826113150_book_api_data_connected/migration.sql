/*
  Warnings:

  - Added the required column `bookId` to the `BookApiData` table without a default value. This is not possible if the table is not empty.

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
    "language" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "BookApiData_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BookApiData" ("authors", "id", "isbn_13", "language", "pageCount", "publishedDate", "subtitle", "thumbnailUrl", "title") SELECT "authors", "id", "isbn_13", "language", "pageCount", "publishedDate", "subtitle", "thumbnailUrl", "title" FROM "BookApiData";
DROP TABLE "BookApiData";
ALTER TABLE "new_BookApiData" RENAME TO "BookApiData";
CREATE UNIQUE INDEX "BookApiData_bookId_key" ON "BookApiData"("bookId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
