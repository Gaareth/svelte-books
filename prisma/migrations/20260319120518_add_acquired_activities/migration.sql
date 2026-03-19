-- delete all Ownership records for books where the only ReadingActivity status is TO_READ
DELETE FROM Ownership
WHERE bookId IN (
    SELECT ra.bookId
    FROM ReadingActivity ra
    JOIN ReadingActivityStatus ras 
      ON ras.id = ra.readingActivityStatusId
    GROUP BY ra.bookId
    HAVING 
        COUNT(*) = 1
        AND MAX(ras.status) = 'TO_READ'
);

-- Add a ReadingActivity with status ACQUIRED for each book with an Ownership
INSERT INTO "ReadingActivity" ("createdAt", "updatedAt", "accountId", "bookId", "readingActivityStatusId")
SELECT 
    CURRENT_TIMESTAMP, -- createdAt
    CURRENT_TIMESTAMP, -- updatedAt
    "Book"."accountId", -- accountId (from the related book)
    "Ownership"."bookId", -- bookId (from Ownership)
    (SELECT "id" FROM "ReadingActivityStatus" WHERE "status" = 'ACQUIRED' LIMIT 1) -- readingActivityStatusId
FROM "Ownership"
JOIN "Book" ON "Ownership"."bookId" = "Book"."id";