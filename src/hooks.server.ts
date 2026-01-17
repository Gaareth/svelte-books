import CredentialsProvider from "@auth/core/providers/credentials";
import { SvelteKitAuth } from "@auth/sveltekit";

import * as seed from "../prisma/seed-initial";
import { verifyPassword } from "./auth";

import { building } from "$app/environment";
import { prisma } from "$lib/server/prisma";

if (!building) {
  try {
    await seed.seedInitial();
    console.log("[!] seeded initial data");
  } catch (e) {
    // ignore
    console.error(e);

    console.log("[!] failed to seed initial data");
  }

  await seed.seedInitialAllAccounts();
}

export const handle = SvelteKitAuth({
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" },
      },

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      async authorize(credentials, req) {
        if (!credentials.username || !credentials.password) {
          if (import.meta.env.DEV) {
            const account = await prisma.account.findFirst({
              where: {
                isAdmin:
                  !credentials.username && !credentials.password
                    ? true
                    : undefined,
                username: credentials.username ?? undefined,
              },
            });
            return {
              id: account!.id,
              name: account!.username,
            };
          }

          return null;
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
          credentials.password.toString()
        );

        if (matching) {
          return {
            id: account.id,
            name: account.username,
          };
        }

        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
});
