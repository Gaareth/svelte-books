import { delay } from "$lib/utils.js";
import { error } from "@sveltejs/kit";

import { event } from "sveltekit-sse";
import { SSE_EVENT } from "./sse";

export async function GET({ request, locals }) {
  console.log(SSE_EVENT);
  const session = await locals.getSession();
  // if (!session) {
  //   throw error(401);
  // }

  return event(async (emit) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (SSE_EVENT.msg.length == 0) {
        emit("undefined");
        await delay(1000);
        continue;
      }

      console.log("sending: ." + JSON.stringify(SSE_EVENT));

      emit(JSON.stringify(SSE_EVENT));
      await delay(500);
    }
  }).toResponse();
}
