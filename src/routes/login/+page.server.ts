import { signIn } from "$src/lib/auth/auth";
import type { PageServerLoad } from "./$types.js";

export const load: PageServerLoad = ({ url }) => {
    return {
        error: url.searchParams.has("error"),
    };
};

export const actions = {
    default: signIn,
};
