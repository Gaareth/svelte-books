import type { Book } from "@prisma/client";
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

export const sum = (list: any[]) => list.reduce((a, b) => a + b);
export const zip = (a: unknown[], b: unknown[]) => a.map((k, i) => [k, b[i]]);

export function dateToYYYY_MM_DD(date: Date) {
  return date.toISOString().split("T")[0];
}

export function getBookReadDate(book: Book) {
  if (book.yearRead === null) {
    return null;
  }
  return new Date(book.yearRead, (book.monthRead ?? 0) - 1);
}

// function sortBooksBy
export function sortBooksDefault(a: Book, b: Book) {
  const read_date_a = getBookReadDate(a);
  const read_date_b = getBookReadDate(b);

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

export const tupleToDataset = (data: [any, number][], label: string) => {
  return {
    labels: data.map((t) => t[0]),
    datasets: [{ data: data.map((t) => t[1]), label }],
  };
};
