/*
Warnings:

- You are about to drop the column `isPublic` on the `Account` table. All the data in the column will be lost.    // already refactored to `visibility` 
- You are about to drop the column `onlyToLoggedIn` on the `Account` table. All the data in the column will be lost. // already refactored to `visibility` 
- You are about to drop the column `aquiredAt` on the `Ownership` table. All the data in the column will be lost. // was empty on the only prod db

 */
-- RedefineTables
PRAGMA defer_foreign_keys = ON;

PRAGMA foreign_keys = OFF;

CREATE TABLE
    "new_Account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "username" TEXT NOT NULL,
        "password_hash" TEXT NOT NULL,
        "password_salt" TEXT NOT NULL DEFAULT '',
        "isAdmin" BOOLEAN NOT NULL DEFAULT false,
        "visibility" TEXT NOT NULL DEFAULT 'PRIVATE'
    );

INSERT INTO
    "new_Account" (
        "id",
        "isAdmin",
        "password_hash",
        "password_salt",
        "username",
        "visibility"
    )
SELECT
    "id",
    "isAdmin",
    "password_hash",
    "password_salt",
    "username",
    "visibility"
FROM
    "Account";

DROP TABLE "Account";

ALTER TABLE "new_Account"
RENAME TO "Account";

CREATE UNIQUE INDEX "Account_username_key" ON "Account" ("username");

CREATE TABLE
    "new_Ownership" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "location" TEXT,
        "acquiredAtId" INTEGER,
        "status" TEXT NOT NULL DEFAULT 'OWNED',
        "bookId" TEXT NOT NULL,
        CONSTRAINT "Ownership_acquiredAtId_fkey" FOREIGN KEY ("acquiredAtId") REFERENCES "OptionalDatetime" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Ownership_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

INSERT INTO
    "new_Ownership" ("bookId", "createdAt", "id", "location", "status")
SELECT
    "bookId",
    "createdAt",
    "id",
    "location",
    "status"
FROM
    "Ownership";

DROP TABLE "Ownership";

ALTER TABLE "new_Ownership"
RENAME TO "Ownership";

CREATE UNIQUE INDEX "Ownership_bookId_key" ON "Ownership" ("bookId");

PRAGMA foreign_keys = ON;

PRAGMA defer_foreign_keys = OFF;