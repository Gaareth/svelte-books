import { delay } from "$lib/utils.js";
import { error, json } from "@sveltejs/kit";

import { event } from "sveltekit-sse";
import { SSE_EVENT } from "./sse";

export async function GET({ request, locals }) {
  console.log(SSE_EVENT);
    const session = await locals.getSession();
    if (!session) {
      throw error(401);
    }

  return event(async (emit) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      console.log("sending: ." + JSON.stringify(SSE_EVENT));

      emit(JSON.stringify(SSE_EVENT));
      await delay(1000);
    }
  }).toResponse();
}
