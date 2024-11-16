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
        "monthRead" INTEGER,
        "yearRead" INTEGER,
        "dateStartedId" INTEGER,
        "dateFinishedId" INTEGER,
        "bookListName" TEXT,
        "bookSeriesId" INTEGER,
        "bookApiDataId" TEXT,
        "wordsPerPage" INTEGER,
        "accountId" TEXT,
        CONSTRAINT "Book_dateStartedId_fkey" FOREIGN KEY ("dateStartedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Book_dateFinishedId_fkey" FOREIGN KEY ("dateFinishedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Book_bookListName_fkey" FOREIGN KEY ("bookListName") REFERENCES "BookList" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Book_bookSeriesId_fkey" FOREIGN KEY ("bookSeriesId") REFERENCES "BookSeries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Book_bookApiDataId_fkey" FOREIGN KEY ("bookApiDataId") REFERENCES "BookApiData" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Book_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );

INSERT INTO
    "new_Book" (
        "author",
        "bookApiDataId",
        "bookListName",
        "bookSeriesId",
        "coverImage",
        "createdAt",
        "dateFinishedId",
        "dateStartedId",
        "id",
        "monthRead",
        "name",
        "updatedAt",
        "wordsPerPage",
        "yearRead",
        "accountId"
    )
SELECT
    "author",
    "bookApiDataId",
    "bookListName",
    "bookSeriesId",
    "coverImage",
    "createdAt",
    "dateFinishedId",
    "dateStartedId",
    "id",
    "monthRead",
    "name",
    "updatedAt",
    "wordsPerPage",
    "yearRead",
    (
        SELECT
            id
        FROM
            "Account"
        ORDER BY
            id
        LIMIT
            1
    )
FROM
    "Book";

DROP TABLE "Book";

ALTER TABLE "new_Book"
RENAME TO "Book";

CREATE UNIQUE INDEX "Book_name_key" ON "Book" ("name");

CREATE UNIQUE INDEX "Book_dateStartedId_key" ON "Book" ("dateStartedId");

CREATE UNIQUE INDEX "Book_dateFinishedId_key" ON "Book" ("dateFinishedId");

PRAGMA foreign_keys = ON;

PRAGMA defer_foreign_keys = OFF;