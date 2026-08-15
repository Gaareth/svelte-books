import { signOut } from "$lib/auth/auth";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = async ({ locals }) => {
    // if you are not logged in, redirect to the login page
    if (!(await locals.auth())) {
        throw redirect(302, "/login");
    }
};

export const actions = { default: signOut } satisfies Actions;
