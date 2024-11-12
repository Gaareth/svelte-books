import { redirect, type ServerLoadEvent } from "@sveltejs/kit";

export async function load({ locals }: ServerLoadEvent) {
  const session = await locals.auth();
  // if (!session) {
  //   error(401);
  // }
  if (session) {
    redirect(302, `/${session.user?.name}`);
  }
}
