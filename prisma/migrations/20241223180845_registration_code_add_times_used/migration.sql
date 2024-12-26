-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegistrationCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "serverSettingsId" INTEGER,
    CONSTRAINT "RegistrationCode_serverSettingsId_fkey" FOREIGN KEY ("serverSettingsId") REFERENCES "ServerSettings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RegistrationCode" ("code", "id", "serverSettingsId") SELECT "code", "id", "serverSettingsId" FROM "RegistrationCode";
DROP TABLE "RegistrationCode";
ALTER TABLE "new_RegistrationCode" RENAME TO "RegistrationCode";
CREATE UNIQUE INDEX "RegistrationCode_code_key" ON "RegistrationCode"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
