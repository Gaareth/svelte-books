import { PrismaClient } from "$prismaClient";
import "dotenv/config";

import {
  createAccount,
  createAllReadingActivityStatus,
  createServerSettings,
} from "$lib/server/db/create";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Load environment variables
// dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export async function isDBSeeded() {
  const accountCount = await prisma.account.count();
  const serverSettingsCount = await prisma.serverSettings.count();

  return accountCount > 0 && serverSettingsCount > 0;
}

export async function seedInitialAllAccounts() {
  const accounts = await prisma.account.findMany();
  for (const account of accounts) {
    try {
      await createAllReadingActivityStatus(account.id, true);
    } catch (error) {
      console.error(
        `[!] failed to seed initial data for account ${account.id}:`,
        error
      );
    }
  }
}

export async function seedInitial() {
  const account = await createAccount(true);
  return {
    account,
    serverSettings: await createServerSettings(),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedInitial()
    .then(() => {
      console.log("Seeding complete.");
      prisma.$disconnect();
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      prisma.$disconnect();
      process.exit(1);
    });
}
