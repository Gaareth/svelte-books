import { json } from "@sveltejs/kit";

import { userAuth } from "$lib/auth/authorization";
import { loadBooks } from "$src/lib/server/db/utils.js";

export async function GET({ locals }) {
    const account = await userAuth(await locals.auth());

    const books = await loadBooks({ accountId: account.id }, undefined);
    if (!books) {
        return json({ success: false });
    }

    return json({ success: true, books });
}
