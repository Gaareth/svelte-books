import { redirect, type ServerLoadEvent } from "@sveltejs/kit";

export async function load(page: ServerLoadEvent) {
  if (await page.locals.auth()) {
    redirect(303, "/");
  }

  const csrfTokenResponse = await page.fetch("/auth/csrf");
  const { csrfToken } = await csrfTokenResponse.json();

  return {
    csrfToken,
    error: page.url.searchParams.get("error"),
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
