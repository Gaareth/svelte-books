-- AlterTable
ALTER TABLE "BookList" ADD COLUMN "visibility" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Account" ("id", "password_hash", "username") SELECT "id", "password_hash", "username" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

UPDATE Account
SET isAdmin = true
WHERE id = (SELECT id FROM Account ORDER BY id ASC LIMIT 1);

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
