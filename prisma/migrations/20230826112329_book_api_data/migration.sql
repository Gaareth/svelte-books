-- CreateTable
CREATE TABLE "BookApiData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "isbn_13" TEXT,
    "pageCount" INTEGER NOT NULL,
    "publishedDate" TEXT NOT NULL,
    "language" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BookCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BookApiDataToBookCategory" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_BookApiDataToBookCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "BookApiData" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BookApiDataToBookCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "BookCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_BookApiDataToBookCategory_AB_unique" ON "_BookApiDataToBookCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_BookApiDataToBookCategory_B_index" ON "_BookApiDataToBookCategory"("B");
