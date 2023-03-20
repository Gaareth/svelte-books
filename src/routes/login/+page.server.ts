import type { RequestEvent } from "./$types";
import { signIn } from "@auth/sveltekit/client";
import { redirect, type ServerLoadEvent } from "@sveltejs/kit";
import { getSession } from "@auth/sveltekit";

export async function load(page: ServerLoadEvent) {
    if (await page.locals.getSession()) {
        throw redirect(303, "/")
    }

    const csrfTokenResponse = await page.fetch("/auth/csrf");
    const { csrfToken } = await csrfTokenResponse.json();    

    return {
        csrfToken,
        error: page.url.searchParams.get("error")
    };
}

// export const actions = {
//   default: async (event: RequestEvent) => {
//     const formData = Object.fromEntries(await event.request.formData());
//     console.log(formData);
    
//     const response = await signIn("credentials", {
//       username: "Gaareth",
//       password: "ttest",
//     });
//     console.log(response);
    
//     return {
//         status: response?.status
//     };
//   },
// };
