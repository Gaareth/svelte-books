import {
  READING_ACTIVITY_TYPES,
  type ReadingActivityStatusType,
} from "./enums";

export const MAX_RATING = 5;
export const GOOGLE_BOOKS_API_REQUEST_DELAY_MS = (60 / 100) * 1000; // 100 requests per minute

export const getReadingActivityColor = (statuss: string): string => {
  const status = statuss as ReadingActivityStatusType;

  switch (status) {
    case READING_ACTIVITY_TYPES.READING:
      return "#3B82F6"; // blue
    case READING_ACTIVITY_TYPES.DID_NOT_FINISH:
      return "#DC2626"; // red
    case READING_ACTIVITY_TYPES.FINISHED:
      return "#22C55E"; // green
    case READING_ACTIVITY_TYPES.PAUSED:
      return "#6B7280"; // gray
    case READING_ACTIVITY_TYPES.TO_READ:
      return "#7DD3FC"; // sky
    case READING_ACTIVITY_TYPES.ACQUIRED:
      return "#A855F7"; // purple
    default: {
      const exhaustiveCheck: never = status;
      throw new Error(`Unhandled status: ${status}`);
    }
  }
};
