import { writable, type Writable } from "svelte/store";

export const darkMode: Writable<boolean> = writable(true);
