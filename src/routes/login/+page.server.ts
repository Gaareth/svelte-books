import type { PageServerLoad } from "./$types.js";

import { signIn } from "$src/lib/auth/auth";

export const load: PageServerLoad = ({ url }) => {
    return {
        error: url.searchParams.has("error"),
    };
};

export const actions = {
    default: signIn,
};
