import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ locals, params }: ServerLoadEvent) {
  const username = params.username;
}
