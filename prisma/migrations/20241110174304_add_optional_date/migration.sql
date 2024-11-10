-- CreateTable
CREATE TABLE "OptionalDatetime" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day" INTEGER,
    "month" INTEGER,
    "year" INTEGER NOT NULL,
    "hour" INTEGER,
    "minute" INTEGER,
    "timezoneOffset" INTEGER
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
    "coverImage" TEXT,
    "monthRead" INTEGER,
    "yearRead" INTEGER,
    "dateStartedId" INTEGER,
    "dateFinishedId" INTEGER,
    "bookListName" TEXT,
    "bookSeriesId" INTEGER,
    "bookApiDataId" TEXT,
    "wordsPerPage" INTEGER,
    CONSTRAINT "Book_dateStartedId_fkey" FOREIGN KEY ("dateStartedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_dateFinishedId_fkey" FOREIGN KEY ("dateFinishedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookListName_fkey" FOREIGN KEY ("bookListName") REFERENCES "BookList" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookSeriesId_fkey" FOREIGN KEY ("bookSeriesId") REFERENCES "BookSeries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookApiDataId_fkey" FOREIGN KEY ("bookApiDataId") REFERENCES "BookApiData" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("author", "bookApiDataId", "bookListName", "bookSeriesId", "coverImage", "createdAt", "id", "monthRead", "name", "updatedAt", "wordsPerPage", "yearRead") SELECT "author", "bookApiDataId", "bookListName", "bookSeriesId", "coverImage", "createdAt", "id", "monthRead", "name", "updatedAt", "wordsPerPage", "yearRead" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_name_key" ON "Book"("name");
CREATE UNIQUE INDEX "Book_dateStartedId_key" ON "Book"("dateStartedId");
CREATE UNIQUE INDEX "Book_dateFinishedId_key" ON "Book"("dateFinishedId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
