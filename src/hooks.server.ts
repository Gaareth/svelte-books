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
        const account = await prisma.account.findFirst({
          where: {
            username: credentials.username,
          },
        });

        if (!account) {
          if (import.meta.env.DEV) {
            return {
              id: 0,
              name: "DEV",
            };
          }
          return null;
        }

        const matching = await argon2.verify(
          account.password_hash,
          credentials.password
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
