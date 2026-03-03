/*
Warnings:

- You are about to drop the column `location` on the `Book` table. All the data in the column will be lost.
- You are about to drop the column `recommendation` on the `Book` table. All the data in the column will be lost.

 */
-- CreateTable
CREATE TABLE
    "Ownership" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "location" TEXT,
        "aquiredAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'OWNED',
        "bookId" TEXT NOT NULL,
        CONSTRAINT "Ownership_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

INSERT INTO
    "Ownership" ("location", "aquiredAt", "status", "bookId")
SELECT
    NULL,
    NULL,
    'OWNED',
    "id"
FROM
    "Book";

-- RedefineTables
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
        "recommendedBy" TEXT,
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
        "description",
        "id",
        "name",
        "updatedAt",
        "wordsPerPage",
        "recommendedBy"
    )
SELECT
    "accountId",
    "author",
    "bookApiDataId",
    "bookListId",
    "bookSeriesId",
    "coverImage",
    "createdAt",
    "description",
    "id",
    "name",
    "updatedAt",
    "wordsPerPage",
    "recommendation"
FROM
    "Book";

DROP TABLE "Book";

ALTER TABLE "new_Book"
RENAME TO "Book";

PRAGMA foreign_keys = ON;

PRAGMA defer_foreign_keys = OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Ownership_bookId_key" ON "Ownership" ("bookId");