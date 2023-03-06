export async function getBookLists() {
    return prisma.bookList.findMany();
}