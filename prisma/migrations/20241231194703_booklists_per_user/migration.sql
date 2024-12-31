/*
  Warnings:

  - You are about to drop the column `bookListName` on the `Book` table. All the data in the column will be lost.
  - The primary key for the `BookList` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `accountId` to the `BookList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `BookList` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
/* CREATE TABLE "Graph" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "labels" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "Graph_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
); */

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "password_salt" TEXT NOT NULL DEFAULT '',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "onlyToLoggedIn" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Account" ("id", "isAdmin", "isPublic", "password_hash", "password_salt", "username") SELECT "id", "isAdmin", "isPublic", "password_hash", "password_salt", "username" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverImage" TEXT,
    "monthRead" INTEGER,
    "yearRead" INTEGER,
    "dateStartedId" INTEGER,
    "dateFinishedId" INTEGER,
    "bookListId" INTEGER,
    "bookSeriesId" INTEGER,
    "bookApiDataId" TEXT,
    "wordsPerPage" INTEGER,
    "accountId" TEXT NOT NULL,
    CONSTRAINT "Book_dateStartedId_fkey" FOREIGN KEY ("dateStartedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_dateFinishedId_fkey" FOREIGN KEY ("dateFinishedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookListId_fkey" FOREIGN KEY ("bookListId") REFERENCES "BookList" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookSeriesId_fkey" FOREIGN KEY ("bookSeriesId") REFERENCES "BookSeries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookApiDataId_fkey" FOREIGN KEY ("bookApiDataId") REFERENCES "BookApiData" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("accountId", "author", "bookApiDataId", "bookSeriesId", "coverImage", "createdAt", "dateFinishedId", "dateStartedId", "id", "monthRead", "name", "updatedAt", "wordsPerPage", "yearRead") SELECT "accountId", "author", "bookApiDataId", "bookSeriesId", "coverImage", "createdAt", "dateFinishedId", "dateStartedId", "id", "monthRead", "name", "updatedAt", "wordsPerPage", "yearRead" FROM "Book";



CREATE TABLE "new_BookList" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "accountId" TEXT NOT NULL,
    CONSTRAINT "BookList_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);


/* generated: INSERT INTO "new_BookList" ("name", "visibility") SELECT "name", coalesce("visibility", 'private') AS "visibility" FROM "BookList";*/

-- Insert default book lists for each user
INSERT INTO "new_BookList" ("name", "accountId")
SELECT listNames.listName, "id"
FROM "Account", 
     (SELECT 'Read' AS listName UNION ALL SELECT 'Reading' UNION ALL SELECT 'To Read') AS listNames;



-- Update bookListId for each Book based on the old bookListName
UPDATE "new_Book"
SET "bookListId" = (
    SELECT "id"
    FROM "new_BookList"
    WHERE "new_BookList"."accountId" = "new_Book"."accountId" AND "new_BookList"."name" = (
        SELECT "bookListName"
        FROM "Book"
        WHERE "Book"."id" = "new_Book"."id"
    )
)
WHERE EXISTS (
    SELECT 1
    FROM "Book"
    WHERE "Book"."id" = "new_Book"."id"
    AND "Book"."bookListName" IS NOT NULL
);


DROP TABLE "BookList";
ALTER TABLE "new_BookList" RENAME TO "BookList";
CREATE UNIQUE INDEX "BookList_name_accountId_key" ON "BookList"("name", "accountId");

DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_name_key" ON "Book"("name");
CREATE UNIQUE INDEX "Book_dateStartedId_key" ON "Book"("dateStartedId");
CREATE UNIQUE INDEX "Book_dateFinishedId_key" ON "Book"("dateFinishedId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
