/*
Warnings:

- You are about to drop the column `dateFinishedId` on the `Book` table. All the data in the column will be lost. (handled)
- You are about to drop the column `dateStartedId` on the `Book` table. All the data in the column will be lost. (handled)
- You are about to drop the column `monthRead` on the `Book` table. All the data in the column will be lost. (okay)
- You are about to drop the column `yearRead` on the `Book` table. All the data in the column will be lost. (okay)
- You are about to drop the column `bookId` on the `Graph` table. All the data in the column will be lost.
- You are about to drop the column `bookId` on the `Rating` table. All the data in the column will be lost.
- Added the required column `readingActivityId` to the `Graph` table without a default value. This is not possible if the table is not empty. (handled)
- Added the required column `ratingId` to the `Rating` table without a default value. This is not possible if the table is not empty.
- Added the required column `readingActivityId` to the `Rating` table without a default value. This is not possible if the table is not empty. (handled)

 */


-- AlterTable
ALTER TABLE "BookApiData"
ADD COLUMN "description" TEXT;

ALTER TABLE "BookApiData"
ADD COLUMN "imageLinksJSON" TEXT;

-- CreateTable
CREATE TABLE
    "ReadingActivity" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        "accountId" TEXT NOT NULL,
        "bookId" TEXT NOT NULL,
        "dateStartedId" INTEGER,
        "dateFinishedId" INTEGER,
        "status" TEXT NOT NULL,
        CONSTRAINT "ReadingActivity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "ReadingActivity_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ReadingActivity_dateStartedId_fkey" FOREIGN KEY ("dateStartedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "ReadingActivity_dateFinishedId_fkey" FOREIGN KEY ("dateFinishedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );

-- For every existing Book, create a ReadingActivity with the status based on the BookList name. 
INSERT INTO
    "ReadingActivity" (
        "accountId",
        "bookId",
        "status",
        "createdAt",
        "updatedAt",
        "dateStartedId",
        "dateFinishedId"
    )
SELECT
    "Book"."accountId",
    "Book"."id",
    CASE
        WHEN "BookList"."name" = 'Read' THEN 'finished'
        WHEN "BookList"."name" = 'Reading' THEN 'reading'
        WHEN "BookList"."name" = 'To read' THEN 'to read'
        ELSE 'finished'
    END AS "status",
    "Book"."createdAt",
    CURRENT_TIMESTAMP,
    "Book"."dateStartedId",
    "Book"."dateFinishedId"
FROM
    "Book"
    LEFT JOIN "BookList" ON "Book"."bookListId" = "BookList"."id";

-- RedefineTables
-- Book
PRAGMA defer_foreign_keys = ON;

PRAGMA foreign_keys = OFF;

CREATE TABLE
    "new_Book" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        "name" TEXT NOT NULL,
        "author" TEXT NOT NULL,
        "coverImage" TEXT,
        "bookListId" INTEGER,
        "bookSeriesId" INTEGER,
        "bookApiDataId" TEXT,
        "wordsPerPage" INTEGER,
        "accountId" TEXT NOT NULL,
        "location" TEXT,
        "recommendation" TEXT,
        "description" TEXT,
        CONSTRAINT "Book_bookListId_fkey" FOREIGN KEY ("bookListId") REFERENCES "BookList" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Book_bookSeriesId_fkey" FOREIGN KEY ("bookSeriesId") REFERENCES "BookSeries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Book_bookApiDataId_fkey" FOREIGN KEY ("bookApiDataId") REFERENCES "BookApiData" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Book_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

INSERT INTO
    "new_Book" (
        "accountId",
        "author",
        "bookApiDataId",
        "bookListId",
        "bookSeriesId",
        "coverImage",
        "createdAt",
        "id",
        "name",
        "updatedAt",
        "wordsPerPage"
    )
SELECT
    "accountId",
    "author",
    "bookApiDataId",
    "bookListId",
    "bookSeriesId",
    "coverImage",
    "createdAt",
    "id",
    "name",
    "updatedAt",
    "wordsPerPage"
FROM
    "Book";

-- 
-- Graph
CREATE TABLE
    "new_Graph" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "title" TEXT NOT NULL,
        "data" TEXT NOT NULL,
        "labels" TEXT NOT NULL,
        "details" TEXT NOT NULL,
        "readingActivityId" INTEGER NOT NULL,
        CONSTRAINT "Graph_readingActivityId_fkey" FOREIGN KEY ("readingActivityId") REFERENCES "ReadingActivity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

INSERT INTO
    "new_Graph" (
        "data",
        "details",
        "id",
        "labels",
        "title",
        "readingActivityId"
    )
    -- The bookId column is being replaced with readingActivityId
SELECT
    "Graph"."data",
    "Graph"."details",
    "Graph"."id",
    "Graph"."labels",
    "Graph"."title",
    (
        SELECT
            "ReadingActivity"."id"
        FROM
            "ReadingActivity"
        WHERE
            "ReadingActivity"."bookId" = "Graph"."bookId"
        ORDER BY
            "ReadingActivity"."id" ASC
        LIMIT
            1
    ) AS "readingActivityId"
FROM
    "Graph";

DROP TABLE "Graph";

ALTER TABLE "new_Graph"
RENAME TO "Graph";

--


-- Rating
CREATE TABLE
    "new_Rating" (
        "ratingId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "stars" REAL,
        "comment" TEXT,
        "readingActivityId" INTEGER NOT NULL,
        CONSTRAINT "Rating_readingActivityId_fkey" FOREIGN KEY ("readingActivityId") REFERENCES "ReadingActivity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

INSERT INTO
    "new_Rating" ("comment", "stars", "readingActivityId")
SELECT
    "comment",
    "stars",
    (
        SELECT
            "ReadingActivity"."id"
        FROM
            "ReadingActivity"
        WHERE
            "ReadingActivity"."bookId" = "Rating"."bookId"
        ORDER BY
            "ReadingActivity"."id" ASC
        LIMIT
            1
    ) AS "readingActivityId"
FROM
    "Rating";

DROP TABLE "Rating";

ALTER TABLE "new_Rating"
RENAME TO "Rating";

CREATE UNIQUE INDEX "Rating_readingActivityId_key" ON "Rating" ("readingActivityId");

--
DROP TABLE "Book";
ALTER TABLE "new_Book"
RENAME TO "Book";
--
PRAGMA foreign_keys = ON;

PRAGMA defer_foreign_keys = OFF;