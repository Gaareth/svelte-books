import { prisma } from "$lib/server/prisma";
import CredentialsProvider from "@auth/core/providers/credentials";
import { SvelteKitAuth } from "@auth/sveltekit";

import { verifyPassword } from "./auth";

import { building } from "$app/environment";

import * as seed from "../prisma/seed-initial";

if (!building) {
  /*  try {
    await seed.createLists();
    console.log("created lists tables");
  } catch (error) {
    // # ignore
  } */
  try {
    await seed.createServerSettings();
    console.log("created server settings");
  } catch (e) {
    // ignore
  }
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
            return {
              id: "0",
              name: "DEV",
            };
          } else {
            return null;
          }
        }

        const account = await prisma.account.findFirst({
          where: {
            username: credentials.username,
          },
        });

        if (!account) {
          return null;
        }

        console.log(credentials.password);

        const matching = await verifyPassword(
          account,
          credentials.password.toString()
        );
        console.log(matching);

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
