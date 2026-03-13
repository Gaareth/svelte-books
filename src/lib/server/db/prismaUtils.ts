import { Visibility, type Account } from "$prismaClient";
import type { Session } from "@auth/sveltekit";

export function whereVisibilityPublicOrAuthenticated(session: Session | null) {
  return {
    OR: [
      { visibility: Visibility.PUBLIC },
      ...(session ? [{ visibility: Visibility.AUTHENTICATED }] : []),
    ],
  };
}

export function whereVisibilityPublicOrAuthenticatedOrAll(
  session: Session | Account | null,
  returnAll: boolean
) {
  const wherePublicOrAuth = {
    OR: [
      { visibility: Visibility.PUBLIC },
      ...(session ? [{ visibility: Visibility.AUTHENTICATED }] : []),
    ],
  };

  if (returnAll) {
    return {
      visibility: undefined,
    };
  } else {
    return wherePublicOrAuth;
  }
}
