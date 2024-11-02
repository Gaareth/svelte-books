import { writable, type Writable } from "svelte/store";
export type THEME = "dark" | "light" | "system";
export const theme: Writable<THEME> = writable("dark");
