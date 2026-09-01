import * as seed from "../prisma/seed-initial";

import { building } from "$app/environment";
import type { ServerInit } from "@sveltejs/kit";
import { validatePrivateConfig } from "./lib/server/config";
import { runCacheCleanupScheduler } from "./lib/server/images/cleanup";

async function initDB() {
    if (!building) {
        if (!(await seed.isDBSeeded())) {
            try {
                await seed.seedInitial();
                console.log("[!] seeded initial data");
            } catch (e) {
                // ignore
                console.error(e);

                console.log("[!] failed to seed initial data");
            }
        }

        await seed.seedInitialAllAccounts();
    }
}

export const init: ServerInit = async () => {
    validatePrivateConfig();
    await initDB();
    await runCacheCleanupScheduler();
};

export { handle } from "$lib/auth/auth";
