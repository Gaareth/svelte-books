import {
  BookOwnership,
  type ReadingActivityType,
  type Visibility,
} from "$prismaBrowser";

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

// export const BOOK_OWNERSHIP_TYPES = {
//   OWNED: "OWNED",
//   NOT_OWNED: "NOT_OWNED",
//   BORROWED: "BORROWED",
//   LIBRARY: "LIBRARY",
// } as const satisfies { [K in BookOwnership]: K };

// export type BookOwnershipType =
//   (typeof BOOK_OWNERSHIP_TYPES)[keyof typeof BOOK_OWNERSHIP_TYPES];

// export const OWNERSHIP_VALUES = Object.values(BOOK_OWNERSHIP_TYPES) as Array<
//   (typeof BOOK_OWNERSHIP_TYPES)[keyof typeof BOOK_OWNERSHIP_TYPES]
// >;

export const OWNERSHIP_VALUES = Object.values(BookOwnership) as Array<
  (typeof BookOwnership)[keyof typeof BookOwnership]
>;
