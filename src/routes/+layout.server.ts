import { getAccountByUsername } from "../auth";

import type { LayoutServerLoad } from "./$types";

export const trailingSlash = "always";

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();
  const account =
    session?.user?.name != null
      ? await getAccountByUsername(session?.user?.name)
      : undefined;

  const data = {
    session,
    isAdmin: account?.isAdmin,
  };

  return data;
};
