import { writable, type Writable } from "svelte/store";
type THEME = "dark" | "light" | "system";
export const theme: Writable<THEME> = writable("dark");
