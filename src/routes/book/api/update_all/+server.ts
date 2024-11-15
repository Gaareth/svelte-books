import { delay } from "$lib/utils.js";
import { error } from "@sveltejs/kit";

import { event } from "sveltekit-sse";
import { SSE_DATA, type SSE_EVENT } from "./sse";
import { getAccountByUsername, getAccountIdfromSession } from "../../../../auth";

export async function GET({ request, locals }) {
  const session = await locals.auth();
  const accountId = await getAccountIdfromSession(session);


  return event(async (emit) => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const userEventData = SSE_DATA[accountId];

      // || userEventData?.msg.length == 0
      if (userEventData == null) {
        emit("undefined");
        await delay(1000);
        continue;
      }

      console.log("sending: ." + JSON.stringify(userEventData));

      emit(JSON.stringify(userEventData));
      await delay(500);
    }
  }).toResponse();
}
