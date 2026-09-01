import type { ReadingActivityWithDates } from "$src/app";
import {
    type ReadingActivityStatusType,
    READING_ACTIVITY_TYPES,
} from "../constants/enums";
import { getReadDate, optionalToDate, toMinutePrecision } from "./dateUtils";

// function sortBooksBy

export function sortReadingActivity(
    a: ReadingActivityWithDates,
    b: ReadingActivityWithDates,
) {
    const read_date_a = getReadDate(a);
    const read_date_b = getReadDate(b);

    const start_date_a = optionalToDate(a.dateStarted);
    const start_date_b = optionalToDate(b.dateStarted);

    // read_date dont store seconds. so we compare them with minute precision, and if they are the same we sort by createdAt
    const date_a = toMinutePrecision(
        read_date_a ?? start_date_a ?? a.createdAt,
    );
    const date_b = toMinutePrecision(
        read_date_b ?? start_date_b ?? b.createdAt,
    );

    // sort by date added, when the read date is the same
    if (date_a == date_b) {
        return (a.createdAt.getTime() - b.createdAt.getTime()) * -1;
    }

    return (date_a - date_b) * -1;
}

export function sortReadingActivityReversed(
    a: ReadingActivityWithDates,
    b: ReadingActivityWithDates,
) {
    return sortReadingActivity(a, b) * -1;
}
export function getActiveActivies<T extends ReadingActivityWithDates>(
    readingActivity: T[],
): T[] {
    const bookToActiveActivity: Record<string, T> = {};

    for (const activity of readingActivity) {
        const active = bookToActiveActivity[activity.bookId];

        if ((active && sortReadingActivity(activity, active) < 0) || !active) {
            bookToActiveActivity[activity.bookId] = activity;
        }
    }

    return Object.values(bookToActiveActivity);
}
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
            const _exhaustiveCheck: never = status;
            throw new Error(`Unhandled status: ${status}`);
        }
    }
};
