/*
  Warnings:

  - The primary key for the `BookCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `BookCategory` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BookApiData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "subtitle" TEXT,
    "thumbnailUrl" TEXT,
    "isbn_13" TEXT,
    "pageCount" INTEGER,
    "publishedDate" TEXT,
    "publisher" TEXT,
    "language" TEXT NOT NULL
);
INSERT INTO "new_BookApiData" ("authors", "id", "isbn_13", "language", "pageCount", "publishedDate", "publisher", "subtitle", "thumbnailUrl", "title") SELECT "authors", "id", "isbn_13", "language", "pageCount", "publishedDate", "publisher", "subtitle", "thumbnailUrl", "title" FROM "BookApiData";
DROP TABLE "BookApiData";
ALTER TABLE "new_BookApiData" RENAME TO "BookApiData";
CREATE TABLE "new_BookCategory" (
    "name" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_BookCategory" ("name") SELECT "name" FROM "BookCategory";
DROP TABLE "BookCategory";
ALTER TABLE "new_BookCategory" RENAME TO "BookCategory";
CREATE TABLE "new__BookApiDataToBookCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BookApiDataToBookCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "BookApiData" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BookApiDataToBookCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "BookCategory" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__BookApiDataToBookCategory" ("A", "B") SELECT "A", "B" FROM "_BookApiDataToBookCategory";
DROP TABLE "_BookApiDataToBookCategory";
ALTER TABLE "new__BookApiDataToBookCategory" RENAME TO "_BookApiDataToBookCategory";
CREATE UNIQUE INDEX "_BookApiDataToBookCategory_AB_unique" ON "_BookApiDataToBookCategory"("A", "B");
CREATE INDEX "_BookApiDataToBookCategory_B_index" ON "_BookApiDataToBookCategory"("B");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
