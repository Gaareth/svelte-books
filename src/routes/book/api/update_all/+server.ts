import { produce } from "sveltekit-sse";

import { SSE_DATA } from "./sse";

import { getAccountIdfromSession } from "$lib/auth/auth";
import { delay } from "$lib/utils/utils.js";

const EVENT_NAME = "update_all";

export async function GET({ locals }) {
    const session = await locals.auth();
    const accountId = await getAccountIdfromSession(session);

    return produce(async ({ emit }) => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const userEventData = SSE_DATA[accountId];

            // || userEventData?.msg.length == 0
            if (userEventData == null) {
                emit(EVENT_NAME, "undefined");
                await delay(1000);
                continue;
            }

            // console.log("sending: ." + JSON.stringify(userEventData));

            emit(EVENT_NAME, JSON.stringify(userEventData));
            await delay(500);
        }
    });
}
