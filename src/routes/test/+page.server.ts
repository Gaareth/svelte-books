// import type { ServerLoadEvent } from "@sveltejs/kit";

// import { userAuth } from "$src/lib/auth/auth";
// import { getReadingActivity } from "$src/lib/server/db/utils";

// export async function load(page: ServerLoadEvent) {
//     const session = await page.locals.auth();
//     const sessionAccount = await userAuth(session);
//     const readingActivities = await getReadingActivity(sessionAccount.id, session, true);

//     return { readingActivities };
// }
