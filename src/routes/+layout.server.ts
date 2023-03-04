// export { load } from "sveltekit-flash-message/server";
import { loadFlash } from "sveltekit-flash-message/server";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
  const data = {
    session: await event.locals.getSession(),
  };
  const flashData = loadFlash(event);
  return Object.assign(flashData, data);
};
