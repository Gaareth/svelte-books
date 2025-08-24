/*
Warnings:

- You are about to drop the column `status` on the `ReadingActivity` table. All the data in the column will be lost.
- Added the required column `readingActivityStatusId` to the `ReadingActivity` table without a default value. This is not possible if the table is not empty.

 */
-- CreateTable
CREATE TABLE
  "ReadingActivityStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "accountId" TEXT NOT NULL,
    CONSTRAINT "ReadingActivityStatus_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );

INSERT INTO
  "ReadingActivityStatus" ("status", "visibility", "accountId")
SELECT
  'finished',
  'private',
  "id"
FROM
  "Account";

INSERT INTO
  "ReadingActivityStatus" ("status", "visibility", "accountId")
SELECT
  'reading',
  'private',
  "id"
FROM
  "Account";

INSERT INTO
  "ReadingActivityStatus" ("status", "visibility", "accountId")
SELECT
  'to read',
  'private',
  "id"
FROM
  "Account";

INSERT INTO
  "ReadingActivityStatus" ("status", "visibility", "accountId")
SELECT
  'did not finish',
  'private',
  "id"
FROM
  "Account";

INSERT INTO
  "ReadingActivityStatus" ("status", "visibility", "accountId")
SELECT
  'paused',
  'private',
  "id"
FROM
  "Account";

-- RedefineTables
PRAGMA defer_foreign_keys = ON;

PRAGMA foreign_keys = OFF;

CREATE TABLE
  "new_ReadingActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "dateStartedId" INTEGER,
    "dateFinishedId" INTEGER,
    "readingActivityStatusId" INTEGER NOT NULL,
    CONSTRAINT "ReadingActivity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReadingActivity_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReadingActivity_dateStartedId_fkey" FOREIGN KEY ("dateStartedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReadingActivity_dateFinishedId_fkey" FOREIGN KEY ("dateFinishedId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReadingActivity_readingActivityStatusId_fkey" FOREIGN KEY ("readingActivityStatusId") REFERENCES "ReadingActivityStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );

INSERT INTO
  "new_ReadingActivity" (
    "accountId",
    "bookId",
    "createdAt",
    "dateFinishedId",
    "dateStartedId",
    "id",
    "updatedAt",
    "readingActivityStatusId"
  )
SELECT
  "accountId",
  "bookId",
  "createdAt",
  "dateFinishedId",
  "dateStartedId",
  "id",
  "updatedAt",
  (
    SELECT
      "ReadingActivityStatus"."id"
    FROM
      "ReadingActivityStatus"
    WHERE
      "ReadingActivityStatus"."status" = "ReadingActivity"."status"
      AND "ReadingActivityStatus"."accountId" = "ReadingActivity"."accountId"
  ) AS "readingActivityStatusId"
FROM
  "ReadingActivity";

DROP TABLE "ReadingActivity";

ALTER TABLE "new_ReadingActivity"
RENAME TO "ReadingActivity";

PRAGMA foreign_keys = ON;

PRAGMA defer_foreign_keys = OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ReadingActivityStatus_status_accountId_key" ON "ReadingActivityStatus" ("status", "accountId");