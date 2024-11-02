// import { PrismaClient } from "@prisma/client";

// const prisma = global.prisma || new PrismaClient();

// if (process.env.NODE_ENV === "development") {
//   global.prisma = prisma;
// }

// export { prisma };

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export { prisma };
