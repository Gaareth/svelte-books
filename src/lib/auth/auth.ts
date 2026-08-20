import { SvelteKitAuth } from "@auth/sveltekit";
import Credentials from "@auth/sveltekit/providers/credentials";

import { prisma } from "$lib/server/prisma";
import { verifyPassword } from "./password";

export const { handle, signIn, signOut } = SvelteKitAuth({
    trustHost: true, // env is not loaded???
    pages: {
        signIn: "/login",
        signOut: "/logout",
    },
    providers: [
        Credentials({
            credentials: {
                username: {
                    label: "Username",
                    type: "text",
                    placeholder: "username",
                },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials.username || !credentials.password) {
                    if (import.meta.env.DEV) {
                        return await handleDEVLogin(
                            credentials.username as string,
                            credentials.password as string,
                        );
                    }

                    throw new Error(
                        "Username and password are required to log in",
                    );
                }

                const account = await prisma.account.findFirst({
                    where: {
                        username: credentials.username,
                    },
                });

                if (!account) {
                    return null;
                }

                const matching = await verifyPassword(
                    account,
                    credentials.password.toString(),
                );

                if (matching) {
                    return {
                        id: account.id,
                        name: account.username,
                    };
                }

                // Return null if user data could not be retrieved
                return null;
                // throw new Error("Invalid credentials.");
            },
        }),
    ],
});

async function handleDEVLogin(username: string, password: string) {
    const shouldLoginWithAdmin = !username && !password;
    const account = await prisma.account.findFirst({
        where: {
            isAdmin: shouldLoginWithAdmin ? true : undefined,
            username: username && username.length > 0 ? username : undefined,
        },
    });
    if (!account) {
        if (shouldLoginWithAdmin) {
            throw new Error(
                "No admin account found. Please create an admin account.",
            );
        }
        // more detailed error message for development (non-prod) login
        throw new Error(
            "Account not found. Please create an account or use the admin account (all empty).",
        );
    }

    return {
        id: account.id,
        name: account.username,
    };
}
