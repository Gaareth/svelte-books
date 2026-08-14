import type { ServerLoadEvent } from "@sveltejs/kit";

import { prisma } from "$lib/server/prisma";
import { Visibility } from "$prismaClient";
import { AUTHENTICATED, PUBLIC } from "$src/lib/constants/enums";
import { whereVisibilityPublicOrAuthenticated } from "$src/lib/server/db/prismaUtils";

export async function load({ locals }: ServerLoadEvent) {
    const session = await locals.auth();
    // no auth necessary for this page, but if the user is logged in, we also show users that are only visible to authenticated users.
    // This is view of a regular user. Admin view under /admin of all users

    const accounts = await prisma.account.findMany({
        where: whereVisibilityPublicOrAuthenticated(session),
        include: {
            books: {
                select: {
                    bookList: true,
                },
            },
            readingActivityStatus: true,
        },
    });

    const filterReadingActivityStatus = (v: Visibility) =>
        v == PUBLIC || (session && v == AUTHENTICATED);

    const users = accounts.map((a) => {
        return {
            username: a.username,
            numBooks: a.books.length,
            readingActivityLists: a.readingActivityStatus.filter((r) =>
                filterReadingActivityStatus(r.visibility),
            ),
        };
    });

    return { users };
}
