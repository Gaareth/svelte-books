import * as seed from "../prisma/seed-initial";

import { building } from "$app/environment";

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

export { handle } from "$lib/auth/auth";
