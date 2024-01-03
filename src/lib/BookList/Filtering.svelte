<script lang="ts">
  import type {
    BookApiDataCategories,
    BookFullType,
    BookIncludeCategory,
  } from "$appTypes";
  import { getBookReadDate, sortBooksDefault } from "$lib/utils";
  import { MAX_RATING } from "../../constants";
  import SortOrder from "./SortOrder.svelte";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import AutoComplete from "simple-svelte-autocomplete";

  //@ts-ignore
  import FilterIcon from "svelte-icons/fa/FaFilter.svelte";
  //@ts-ignore
  import SortDesc from "svelte-icons/fa/FaSortAmountDown.svelte";
  //@ts-ignore
  import SortAsc from "svelte-icons/fa/FaSortAmountUp.svelte";

  export let books_displayed: BookFullType[];
  export let languages_used: string[];
  export let category_names: string[]; // not reactive
  export let searchStore;

  let allowed_categories_filter: string[] | undefined;
  let rating_filter: number | undefined;
  let start_filter: Date | undefined;
  let end_filter: Date | undefined;
  let lang_filter: string | undefined;

  let sortingReversed = false;

  type sortOption =
    | "date_created"
    | "date_read"
    | "author"
    | "title"
    | "rating";
  let selectedSort: sortOption = "date_read";

  const sortBooks = () => {
    console.log(books_displayed);

    // books_displayed = books_displayed.sort(
    //   (a, b) => cmpBooks(a, b) * (sortingReversed ? -1 : 1)
    // );

    $searchStore!.sort = (a: BookFullType, b: BookFullType) =>
      cmpBooks(a, b) * (sortingReversed ? -1 : 1);
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
      rating_filter === undefined || Math.floor(b.rating?.stars ?? 0) == rating_filter;
    let f_start = (b: BookFullType) =>
      start_filter === undefined ||
      (getBookReadDate(b) !== null && getBookReadDate(b)! >= start_filter);

    let f_end = (b: BookFullType) =>
      end_filter === undefined ||
      (getBookReadDate(b) !== null && getBookReadDate(b)! <= end_filter);

    let f_category = (b: BookFullType) =>
      allowed_categories_filter === undefined ||
      allowed_categories_filter.length == 0 ||
      b.bookApiData?.categories.find(({ name: c }) =>
        allowed_categories_filter!.includes(c)
      );

    let f_lang = (b: BookFullType) =>
      lang_filter === undefined ||
      lang_filter == "all" ||
      b.bookApiData?.language == lang_filter;

    $searchStore!.filter = (b: BookFullType) =>
      f_rating(b) && f_lang(b) && f_category(b) && f_start(b) && f_end(b);
  };

  const resetFilter = () => {
    allowed_categories_filter = undefined;
    rating_filter = undefined;
    start_filter = undefined;
    end_filter = undefined;
    lang_filter = undefined;
  };

  function parseDateInput(event: Event) {
    if (event.target !== null) {
      return new Date((event.target as HTMLDataElement).value);
    } else {
      return new Date(0);
    }
  }
</script>

<div class="mt-4 mb-8">
  <div class="grid grid-cols-1 gap-6">
    <details class="flex flex-col">
      <summary class="text-2xl">
        <div class="inline-flex items-center gap-2">
          Sorting
          <span class="inline-block w-5">
            {#if sortingReversed}
              <SortDesc />
            {:else}
              <SortAsc />
            {/if}
          </span>
        </div>
      </summary>
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
    </details>

    <details class="flex flex-col">
      <summary class="text-2xl">
        <div class="inline-flex items-center gap-2">
          Filter
          <span class="inline-block w-4">
            <FilterIcon />
          </span>
        </div>
      </summary>
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
            class="input dark:bg-slate-600 dark:border-slate-500 my-2"
            className="!h-full"
          />
        </label>

        <label class="flex flex-col">
          Start date
          <input
            type="date"
            class="default-border"
            on:change={(e) => (start_filter = parseDateInput(e))}
          />
        </label>

        <label class="flex flex-col">
          End date
          <input
            type="date"
            class="default-border"
            on:change={(e) => (end_filter = parseDateInput(e))}
          />
        </label>
      </div>
      <div class="w-full md:w-fit flex gap-2 self-end">
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
    </details>
  </div>
</div>
