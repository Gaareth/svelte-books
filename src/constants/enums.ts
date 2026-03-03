import type { ReadingActivityType, Visibility } from "$prismaClient";

export const VISIBILITY_TYPES = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  UNLISTED: "UNLISTED",
  AUTHENTICATED: "AUTHENTICATED",
} as const satisfies { [K in Visibility]: K };

export const READING_ACTIVITY_TYPES = {
  TO_READ: "TO_READ",
  READING: "READING",
  FINISHED: "FINISHED",
  PAUSED: "PAUSED",
  DID_NOT_FINISH: "DID_NOT_FINISH",
  ACQUIRED: "ACQUIRED",
} as const satisfies { [K in ReadingActivityType]: K };

export type VisibilityType = keyof typeof VISIBILITY_TYPES;
export type ReadingActivityStatusType = keyof typeof READING_ACTIVITY_TYPES;

export const READING_STATUS_VALUES = Object.values(
  READING_ACTIVITY_TYPES
) as Array<
  (typeof READING_ACTIVITY_TYPES)[keyof typeof READING_ACTIVITY_TYPES]
>;
// Ensure READING_STATUS_VALUES is a tuple for Zod enum
export const READING_STATUS_VALUES_TUPLE = READING_STATUS_VALUES as [
  string,
  ...string[]
];
