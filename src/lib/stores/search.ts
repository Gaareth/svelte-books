import { sortBooksDefault } from "$lib/utils";
import type { Book } from "@prisma/client";
import FuzzySearch from "fuzzy-search";
import { writable } from "svelte/store";

type sortOption = "date_created" | "date_read" | "author" | "title" | "ranking";

export interface SearchStoreModel<T extends Record<PropertyKey, any>> {
  data: T[];
  filtered: T[];
  search: string;
  // sorting: sortOption;
}

export const createSearchStore = <T extends Record<PropertyKey, any>>(
  data: T[]
) => {
  const { subscribe, set, update } = writable<SearchStoreModel<T>>({
    data: data,
    filtered: data,
    search: "",
    // sorting: "date_read",
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
  // console.log("fuzyy sorting");
  

  // store.filtered = store.filtered.sort(sortBooks(store.sorting));
};
