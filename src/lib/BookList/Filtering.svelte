<script lang="ts">
  import type {
    BookApiDataCategories,
    BookFullType,
    BookIncludeCategory,
  } from "$appTypes";
  import { getBookReadDate, sortBooksDefault } from "$lib/utils";
  import type { BookCategory } from "@prisma/client";
  import { MAX_RATING } from "../../constants";
  import SortOrder from "./SortOrder.svelte";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import AutoComplete from "simple-svelte-autocomplete";

  let sortingReversed = false;

  type sortOption =
    | "date_created"
    | "date_read"
    | "author"
    | "title"
    | "rating";

  export let books_displayed: BookFullType[];
  export let languages_used: string[];
  export let category_names: string[]; // not reactive
  export let searchStore;

  let selectedSort: sortOption = "date_read";

  let allowed_categories_filter: string[];
  let rating_filter: number;
  let start_filter: Date;
  let end_filter: Date;
  let lang_filter: string;

  const sortBooks = () => {
    console.log(books_displayed);

    books_displayed = books_displayed.sort(
      (a, b) => cmpBooks(a, b) * (sortingReversed ? -1 : 1)
    );
  };

  const cmpBooks = (b1: BookFullType, b2: BookFullType) => {
    switch (selectedSort) {
      case "date_created":
        return b1.createdAt.getTime() - b2.createdAt.getTime();

      case "author":
        return b1.author.localeCompare(b2.author);

      case "title":
        return b1.name.localeCompare(b2.name);

      case "rating":
        return (b1.rating?.stars ?? 0) - (b2.rating?.stars ?? 0);

      case "date_read":
      default:
        return sortBooksDefault(b1, b2) * -1;
    }
  };

  const filter = () => {
    let f_rating = (b: BookFullType) =>
      rating_filter === undefined || b.rating?.stars == rating_filter;
    let f_start = (b: BookFullType) =>
      start_filter === undefined ||
      (getBookReadDate(b) !== null && getBookReadDate(b)! >= start_filter);

    let f_end = (b: BookFullType) =>
      end_filter === undefined ||
      (getBookReadDate(b) !== null && getBookReadDate(b)! <= end_filter);
    let f_category = (b: BookFullType) =>
      allowed_categories_filter === undefined ||
      allowed_categories_filter.find((c) =>
        b.bookApiData?.categories.includes({ name: c })
      );

    let f_lang = (b: BookFullType) =>
      lang_filter === undefined ||
      lang_filter == "all" ||
      b.bookApiData?.language == lang_filter;

    console.log("filter");
    console.log(rating_filter);

    $searchStore!.filter = f_rating;
    // books_displayed = books_displayed.filter((b) => false);
    // console.log(books_displayed.length);
    // books_displayed = [books_displayed[0]]
  };

  const resetFilter = () => {
    allowed_categories_filter = undefined;
    rating_filter = undefined;
    start_filter = undefined;
    end_filter = undefined;
    lang_filter = undefined;
  };
</script>

<div class="mt-4 mb-8">
  <div class="grid grid-cols-1 gap-6">
    <div class="flex flex-col">
      <p class="text-2xl">Sorting</p>
      <div class="flex gap-2 mt-2">
        <label>
          <select
            class="default-border border-red-600 border"
            bind:value={selectedSort}
            on:change={sortBooks}
          >
            <option value="date_read">Sort by date</option>
            <option value="date_created">Sort by date created</option>
            <option value="title">Sort by title</option>
            <option value="author">Sort by author</option>
            <option value="rating">Sort by rating</option>
          </select>
        </label>
        <SortOrder bind:reversed={sortingReversed} on:click={sortBooks} />
      </div>
    </div>

    <div class="flex flex-col">
      <p class="text-2xl">Filter</p>
      <div class="flex flex-col flex-wrap gap-2 mt-2 md:justify-between">
        <label class="flex flex-col">
          Rating ({rating_filter} / {MAX_RATING})
          <input
            type="range"
            min="0"
            max={MAX_RATING}
            bind:value={rating_filter}
          />
        </label>

        <label class="flex flex-col">
          Languages
          <select class="default-border" bind:value={lang_filter}>
            {#each languages_used as lang}
              <option value="all" selected>all</option>
              <option value={lang}>{lang}</option>
            {/each}
          </select>
        </label>

        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="flex flex-col">
          Categories {category_names.length == 0 ? "(empty)" : ""}
          <AutoComplete
            disabled={category_names.length == 0}
            items={category_names}
            bind:selectedItem={allowed_categories_filter}
            multiple={true}
            create={false}
            id="categories"
            name="categories"
            class="input dark:bg-slate-600 dark:border-slate-500"
          />
        </label>

        <label class="flex flex-col">
          Start date
          <input type="date" class="default-border" bind:value={start_filter} />
        </label>

        <label class="flex flex-col">
          End date
          <input type="date" class="default-border" bind:value={end_filter} />
        </label>
      </div>
      <div class="w-full md:w-fit flex gap-1 self-end">
        <button
          class="btn-secondary-black block my-3 px-8 text-center w-full md:w-fit"
          on:click={resetFilter}
        >
          Reset
        </button>
        <button
          class="btn-primary-black block my-3 px-8 text-center w-full md:w-fit"
          on:click={filter}
        >
          Filter
        </button>
      </div>
    </div>
  </div>
</div>
