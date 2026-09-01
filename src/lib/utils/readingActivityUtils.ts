import type { ReadingActivityWithDates } from "$src/app";
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
