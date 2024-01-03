// import { sortBooksDefault } from "$lib/utils";
// import type { Book } from "@prisma/client";
import type { BookFullType } from "$appTypes";
import FuzzySearch from "fuzzy-search";
import { writable } from "svelte/store";

export interface SearchStoreModel<T extends Record<PropertyKey, any>> {
  data: T[];
  filtered: T[];
  search: string;
  // sorting: sortOption;
  filter: (t: T) => boolean;
  sort: (t1: T, t2: T) => number;
}

export const createSearchStore = <T extends Record<PropertyKey, any>>(
  data: T[]
) => {
  const { subscribe, set, update } = writable<SearchStoreModel<T>>({
    data: data,
    filtered: data,
    search: "",
    // sorting: "date_read",
    filter: () => true,
    sort: () => 0,
  });

  return {
    subscribe,
    set,
    update,
  };
};

export const searchHandler = <T extends Record<PropertyKey, any>>(
  store: SearchStoreModel<T>
) => {
  const searcher = new FuzzySearch(store.data, ["name", "author"], {
    caseSensitive: false,
  });

  const searchTerm = store.search.toLowerCase() || "";
  store.filtered = searcher.search(searchTerm)
  store.filtered = store.filtered.filter(store.filter)
  console.log("fuzyy sorting");
  

  store.filtered = store.filtered.sort(store.sort);
};
