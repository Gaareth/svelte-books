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
