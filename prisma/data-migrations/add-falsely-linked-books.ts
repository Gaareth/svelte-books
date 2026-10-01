import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

console.log(`Using database connection string: ${connectionString}`);
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function addMissingBooks() {
    await prisma.$transaction(async (tx) => {
        const activities = await tx.readingActivity.findMany({
            include: {
                book: true,
            },
        });

        const alreadyCreated = new Map<string, string>();

        for (const activity of activities) {
            if (activity.book.accountId === activity.accountId) {
                continue;
            }

            const key = `${activity.book.id}:${activity.accountId}`;

            let newBookId = alreadyCreated.get(key);

            if (!newBookId) {
                const newBook = await tx.book.create({
                    data: {
                        accountId: activity.accountId,
                        name: activity.book.name,
                        author: activity.book.author,
                    },
                });

                newBookId = newBook.id;
                alreadyCreated.set(key, newBookId);
                console.log(
                    `Created new book for account ${activity.accountId} with name "${activity.book.name}"`,
                );
            }

            await tx.readingActivity.update({
                where: { id: activity.id },
                data: {
                    bookId: newBookId,
                },
            });
        }

        console.log(
            `Successfully created ${alreadyCreated.size} missing books!`,
        );
    });
}

addMissingBooks()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
