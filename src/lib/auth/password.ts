import type { Account } from "$src/generated/prisma/client";
import * as argon2 from "argon2";

const { randomBytes } = await import("node:crypto");

export async function hashPassword(password: string) {
    const salt = randomBytes(64).toString("hex");
    const hash = await argon2.hash(password + salt);

    return {
        salt,
        hash,
    };
}

export async function verifyPassword(account: Account, password: string) {
    return await argon2.verify(
        account.password_hash,
        password + account.password_salt,
    );
}
