import type { LayoutServerLoad } from "./$types";

export const trailingSlash = 'always';

export const load: LayoutServerLoad = async (event) => {
  const data = {
    session: await event.locals.getSession(),
  };
  return data;
};
