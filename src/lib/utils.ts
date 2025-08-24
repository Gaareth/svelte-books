import { sineInOut } from "svelte/easing";

import type { ImageLinksType, ReadingActivityWithDates } from "$appTypes";
import type { BookApiData } from "@prisma/client";
import type { OptionalDate } from "./DateSelector.svelte";
import type { THEME } from "./stores/stores";

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const isDarkModeEnabled = (theme: THEME, window: Window): boolean => {
  return (
    theme == "dark" ||
    (theme == "system" &&
      window &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
};

export function arrMax(arr: number[]) {
  if (arr.length === 0) {
    return undefined;
  }

  let maxValue = arr[0];
  let maxIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > maxValue) {
      maxIndex = i;
      maxValue = arr[i];
    }
  }

  return { maxIndex, maxValue };
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export const sum = (list: any[]) => list.reduce((a, b) => a + b, 0);
export const zip = (a: unknown[], b: unknown[]) => a.map((k, i) => [k, b[i]]);

export function undefinedToNull<Type>(any: Type | undefined): Type | null {
  return any === undefined ? null : any;
}

export function nullToUndefined<Type>(any: Type | null): Type | undefined {
  return any === null ? undefined : any;
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

export function optionalToDate(o: OptionalDate | null) {
  if (o?.year == null) {
    return null;
  }

  return new Date(
    o.year,
    (o.month ?? 0) - 1,
    o.day ?? 1,
    o.hour ?? 0,
    o.minute ?? 0
  );
}

export function getReadDate(readingActivity: ReadingActivityWithDates) {
  return optionalToDate(readingActivity.dateFinished) ?? null;
}

// function sortBooksBy
export function sortReadingActivity(
  a: ReadingActivityWithDates,
  b: ReadingActivityWithDates
) {
  const read_date_a = getReadDate(a);
  const read_date_b = getReadDate(b);

  let date_a: Date = read_date_a ?? a.createdAt;
  let date_b: Date = read_date_b ?? b.createdAt;

  // sort by date added, when the read date is the same
  if (read_date_a?.getTime() == read_date_b?.getTime()) {
    date_a = a.createdAt;
    date_b = b.createdAt;
  }

  return (date_a.getTime() - date_b.getTime()) * -1;
}

export const replaceStateWithQuery = (values: Record<string, string>) => {
  const url = new URL(window.location.toString());
  for (const [k, v] of Object.entries(values)) {
    if (v) {
      url.searchParams.set(k, v);
    } else {
      url.searchParams.delete(k);
    }
  }
  history.replaceState(history.state, "", url);
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
export function uniq<T>(a: T[]): T[] {
  const prims: Record<string, Set<unknown>> = {
    boolean: new Set(),
    number: new Set(),
    string: new Set(),
  };
  const objs: T[] = [];

  return a.filter((item) => {
    const type = typeof item;
    if (type in prims) {
      if (prims[type].has(item)) {
        return false;
      }
      prims[type].add(item);
      return true;
    } else {
      if (objs.includes(item)) {
        return false;
      }
      objs.push(item);
      return true;
    }
  });
}

export function uniqBy<T, K>(a: T[], key: (item: T) => K): T[] {
  const seen: Record<string, boolean> = {};

  return a.filter((item) => {
    const k = key(item) as unknown as string; // Ensure compatibility with `Record<string, boolean>`
    return Object.prototype.hasOwnProperty.call(seen, k)
      ? false
      : (seen[k] = true);
  });
}

export function slideHeight(node: Element) {
  const style = getComputedStyle(node);
  const height = parseFloat(style.height);

  return {
    duration: 500,
    css: (t: number) => `height: ${t * height}px; overflow: hidden;`,
    easing: sineInOut,
  };
}

export function dateDiffFormatted(
  date1: Date | string | null,
  date2: Date | string | null
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

export function getMaxResolutionImage(apiData: BookApiData | null) {
  if (!apiData) return null;

  const imageLinks = JSON.parse(
    apiData.imageLinksJSON || "{}"
  ) as ImageLinksType;

  return (
    imageLinks?.extraLarge ||
    imageLinks?.large ||
    imageLinks?.medium ||
    imageLinks?.thumbnail ||
    imageLinks?.smallThumbnail ||
    null
  );
}
