-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BookList" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverImage" TEXT,
    "monthRead" INTEGER,
    "yearRead" INTEGER,
    "bookListName" TEXT,
    "bookSeriesId" INTEGER,
    "bookApiDataId" TEXT,
    "wordsPerPage" INTEGER,
    CONSTRAINT "Book_bookApiDataId_fkey" FOREIGN KEY ("bookApiDataId") REFERENCES "BookApiData" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookSeriesId_fkey" FOREIGN KEY ("bookSeriesId") REFERENCES "BookSeries" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Book_bookListName_fkey" FOREIGN KEY ("bookListName") REFERENCES "BookList" ("name") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rating" (
    "stars" REAL NOT NULL,
    "bookId" TEXT NOT NULL,
    "comment" TEXT,
    CONSTRAINT "Rating_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookApiData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "subtitle" TEXT,
    "thumbnailUrl" TEXT,
    "isbn_13" TEXT,
    "pageCount" INTEGER,
    "publishedDate" TEXT,
    "publisher" TEXT,
    "language" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BookCategory" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "BookSeries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "_BookApiDataToBookCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BookApiDataToBookCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "BookApiData" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BookApiDataToBookCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "BookCategory" ("name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_name_key" ON "Book"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_bookId_key" ON "Rating"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "_BookApiDataToBookCategory_AB_unique" ON "_BookApiDataToBookCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_BookApiDataToBookCategory_B_index" ON "_BookApiDataToBookCategory"("B");

