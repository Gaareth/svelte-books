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
        "isPublic" BOOLEAN NOT NULL DEFAULT false,
        "onlyToLoggedIn" BOOLEAN NOT NULL DEFAULT false,
        "visibility" TEXT NOT NULL DEFAULT 'PRIVATE'
    );

INSERT INTO
    "new_Account" (
        "id",
        "isAdmin",
        "isPublic",
        "onlyToLoggedIn",
        "password_hash",
        "password_salt",
        "username",
        "visibility"
    )
SELECT
    "id",
    "isAdmin",
    "isPublic",
    "onlyToLoggedIn",
    "password_hash",
    "password_salt",
    "username",
    CASE
        WHEN "isPublic" = 1 THEN 'PUBLIC'
        WHEN "onlyToLoggedIn" = 1 THEN 'AUTHENTICATED'
        ELSE 'PRIVATE'
    END
FROM
    "Account";

DROP TABLE "Account";

ALTER TABLE "new_Account"
RENAME TO "Account";

CREATE UNIQUE INDEX "Account_username_key" ON "Account" ("username");

CREATE TABLE
    "new_BookList" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
        "accountId" TEXT NOT NULL,
        CONSTRAINT "BookList_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

INSERT INTO
    "new_BookList" ("accountId", "id", "name", "visibility")
SELECT
    "accountId",
    "id",
    "name",
    UPPER("visibility") AS "visibility"
FROM
    "BookList";

DROP TABLE "BookList";

ALTER TABLE "new_BookList"
RENAME TO "BookList";

CREATE UNIQUE INDEX "BookList_name_accountId_key" ON "BookList" ("name", "accountId");

CREATE TABLE
    "new_ReadingActivityStatus" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "status" TEXT NOT NULL,
        "visibility" TEXT NOT NULL DEFAULT 'PRIVATE',
        "accountId" TEXT NOT NULL,
        CONSTRAINT "ReadingActivityStatus_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

INSERT INTO
    "new_ReadingActivityStatus" ("accountId", "id", "status", "visibility")
SELECT
    "accountId",
    "id",
    case
        when "status" = 'to read' then 'TO_READ'
        when "status" = 'reading' then 'READING'
        when "status" = 'finished' then 'FINISHED'
        when "status" = 'did not finish' then 'DID_NOT_FINISH'
        when "status" = 'paused' then 'PAUSED'
        else UPPER("status")
    end as "status",
    UPPER("visibility") AS "visibility"
FROM
    "ReadingActivityStatus";

DROP TABLE "ReadingActivityStatus";

ALTER TABLE "new_ReadingActivityStatus"
RENAME TO "ReadingActivityStatus";

CREATE UNIQUE INDEX "ReadingActivityStatus_status_accountId_key" ON "ReadingActivityStatus" ("status", "accountId");

PRAGMA foreign_keys = ON;

PRAGMA defer_foreign_keys = OFF;