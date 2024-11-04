/* eslint-disable */
// @ts-nocheck
// https://github.com/nextauthjs/next-auth/issues/6174

import { SvelteKitAuth } from "@auth/sveltekit";
import CredentialsProvider from "@auth/core/providers/credentials";
import { prisma } from "$lib/server/prisma";

import * as argon2 from "argon2";

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
      async authorize(credentials, req) {
        if (import.meta.env.DEV) {
          return {
            id: 0,
            name: "DEV",
          };
        }

        const account = await prisma.account.findFirst({
          where: {
            username: credentials.username,
          },
        });

        if (!account) {
          return null;
        }

        const matching = await argon2.verify(
          credentials.password,
          account.password_hash
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
