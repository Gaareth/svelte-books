import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load(page: ServerLoadEvent) {
  const csrfTokenResponse = await page.fetch("/auth/csrf");
  const { csrfToken } = await csrfTokenResponse.json();

  return {
    csrfToken,
  };
}
