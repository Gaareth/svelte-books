import { prisma } from "$lib/server/prisma";
import type { Session } from "@auth/sveltekit";
import { error } from "@sveltejs/kit";
import { StatusCodes } from "http-status-codes";

export async function getAccountIdfromSession(session: Session | null) {
    if (session?.user?.name == null) {
        error(401);
    }

    const account = await getAccountByUsername(session?.user?.name);
    if (account != null) {
        return account.id;
    } else {
        error(StatusCodes.NOT_FOUND, "No account linked to session found");
    }
}

export async function getAccountByUsername(username: string) {
    return await prisma.account.findUnique({
        where: {
            username,
        },
    });
}
