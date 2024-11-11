import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fillDateFinished() {
  await prisma.$transaction(async (tx) => {
    // Get all books that have a yearRead
    const books = await tx.book.findMany({
      where: {
        yearRead: {
          not: null,
        },
      },
    });

    // Loop through each book and create a corresponding OptionalDatetime
    for (const book of books) {
      const { yearRead, monthRead } = book;

      // Ensure both year and month are present before proceeding
      if (yearRead) {
        // Create a new OptionalDatetime entry
        const optionalDatetime = await tx.optionalDatetime.create({
          data: {
            year: yearRead,
            month: monthRead,
          },
        });

        // Update the book with the new dateFinished reference
        await tx.book.update({
          where: { id: book.id },
          data: {
            dateFinishedId: optionalDatetime.id, // Link to the OptionalDatetime
          },
        });
      }
    }

    console.log("dateFinished populated successfully!");
  });
}

fillDateFinished()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
