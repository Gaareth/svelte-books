import { produce } from "sveltekit-sse";

import { SSE_DATA, SSE_EVENT_NAME } from "./sse";

import { getAccountIdfromSession } from "$lib/auth/account";
import { delay } from "$lib/utils/utils.js";

export async function GET({ locals }) {
    const session = await locals.auth();
    const accountId = await getAccountIdfromSession(session);

    return produce(async ({ emit }) => {
        while (true) {
            const userEventData = SSE_DATA[accountId];

            // || userEventData?.msg.length == 0
            if (userEventData == null) {
                emit(SSE_EVENT_NAME, "undefined");
                await delay(1000);
                continue;
            }

            // console.log("sending: ." + JSON.stringify(userEventData));

            emit(SSE_EVENT_NAME, JSON.stringify(userEventData));
            await delay(500);
        }
    });
}
