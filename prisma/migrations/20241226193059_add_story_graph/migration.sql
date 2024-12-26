-- CreateTable
CREATE TABLE "Graph" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "labels" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "Graph_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
