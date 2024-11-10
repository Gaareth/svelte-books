import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fillDateFinished() {
  // Get all books that have a yearRead and monthRead
  const books = await prisma.book.findMany({
    where: {
      yearRead: {
        not: null,
      },
      monthRead: {
        not: null,
      },
    },
  });

  // Loop through each book and create a corresponding OptionalDatetime
  for (const book of books) {
    const { yearRead, monthRead } = book;

    // Ensure both year and month are present before proceeding
    if (yearRead && monthRead) {
      // Create a new OptionalDatetime entry
      const optionalDatetime = await prisma.optionalDatetime.create({
        data: {
          year: yearRead,
          month: monthRead,
        },
      });

      // Update the book with the new dateFinished reference
      await prisma.book.update({
        where: { id: book.id },
        data: {
          dateFinishedId: optionalDatetime.id, // Link to the OptionalDatetime
        },
      });
    }
  }

  console.log("dateFinished populated successfully!");
}

fillDateFinished()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
