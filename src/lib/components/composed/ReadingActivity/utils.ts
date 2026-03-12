import {
  READING_ACTIVITY_TYPES,
  type ReadingActivityStatusType,
} from "$lib/constants/enums";

export function shouldShowRating(
  status: ReadingActivityStatusType | undefined
) {
  return (
    !!status &&
    status !== READING_ACTIVITY_TYPES.TO_READ &&
    status !== READING_ACTIVITY_TYPES.ACQUIRED
  );
}

export function shouldShowFinishedDate(
  status: ReadingActivityStatusType | undefined
) {
  return (
    !!status &&
    (status === READING_ACTIVITY_TYPES.FINISHED ||
      status === READING_ACTIVITY_TYPES.DID_NOT_FINISH ||
      status === READING_ACTIVITY_TYPES.PAUSED)
  );
}

export function shouldShowStartedDate(
  status: ReadingActivityStatusType | undefined
) {
  return (
    !!status &&
    status !== READING_ACTIVITY_TYPES.TO_READ &&
    status !== READING_ACTIVITY_TYPES.ACQUIRED
  );
}
