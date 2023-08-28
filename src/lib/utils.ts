import type { THEME } from "./stores/stores";

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const isDarkModeEnabled = (theme: THEME, window: Window): boolean => {
  return theme == "dark" ||
    (theme == "system" && window && 
      window.matchMedia("(prefers-color-scheme: dark)").matches);
};
