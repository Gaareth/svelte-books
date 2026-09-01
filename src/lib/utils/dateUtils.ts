import type { ReadingActivityWithDates } from "$src/app";
import type { OptionalDate } from "../components/input/DateSelector.svelte";

export function dateDiffFormatted(
    date1: Date | string | null,
    date2: Date | string | null,
): string {
    if (!date1 || !date2) {
        return "N/A";
    }

    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const diffMs = Math.abs(d1.getTime() - d2.getTime());
    const seconds = Math.floor(diffMs / 1000);

    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return `${days} day${days !== 1 ? "s" : ""}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months} month${months !== 1 ? "s" : ""}`;
    }

    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? "s" : ""}`;
}
export function toMinutePrecision(date: Date) {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
    ).getTime();
}
// TODO:
// export function optionalToDate(o: OptionalDate | null | undefined) {
//   if (o?.year == null) {
//     return null;
//   }
//   const date = new Date(Date.UTC(
//     o.year,
//     (o.month ?? 1) - 1,
//     o.day ?? 1,
//     o.hour ?? 0,
//     o.minute ?? 0
//   ));
//   if (o.timezoneOffset != null) {
//     date.setUTCMinutes(date.getUTCMinutes() - o.timezoneOffset);
//   }
//   return date;
// }

export function optionalToDate(o: OptionalDate | null | undefined) {
    if (o?.year == null) {
        return null;
    }

    return new Date(
        o.year,
        (o.month ?? 0) - 1,
        o.day ?? 1,
        o.hour ?? 0,
        o.minute ?? 0,
    );
}

export function dateToOptional(date: Date) {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        timezoneOffset: date.getTimezoneOffset(),
    };
}

export function getReadDate(readingActivity: ReadingActivityWithDates) {
    return optionalToDate(readingActivity.dateFinished) ?? null;
}
export function dateToYYYY_MM_DD(date: Date) {
    // this ignores timezone
    // return date.toISOString().split("T")[0];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dtString = `${year}-${month}-${day}`;
    // Format the date to 'YYYY-MM-DD'
    return dtString;
}
// month is zero based

export function isValidDate(year: number, month: number, day: number): boolean {
    // month is zero-based, so we create a date with the exact inputs
    const date = new Date(year, month, day);

    // Check if the date matches the input values
    return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
    );
}
