<script lang="ts">
  import { onMount } from "svelte";

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import AutoComplete from "simple-svelte-autocomplete";

  //@ts-ignore
  import FilterIcon from "svelte-icons/fa/FaFilter.svelte";
  //@ts-ignore
  import SortDesc from "svelte-icons/fa/FaSortAmountDown.svelte";
  //@ts-ignore
  import SortAsc from "svelte-icons/fa/FaSortAmountUp.svelte";

  import EqRelation from "./EqRelation.svelte";
  import SortOrder from "./SortOrder.svelte";
  import { MAX_RATING } from "../../constants";

  import type { BookFullType, ReadingListItemType } from "$appTypes";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { createSearchStore } from "$lib/stores/search";
  import {
    dateToYYYY_MM_DD,
    optionalToDate,
    sortReadingActivity,
  } from "$lib/utils";

  let books_displayed: BookFullType[];
  export let languages_used: string[];
  export let category_names: string[]; // not reactive

  export let searchStore: ReturnType<typeof createSearchStore<any>>;

  let allowed_categories_filter: string[] | undefined;
  let rating_filter: number | undefined;
  let start_filter: Date | undefined;
  let end_filter: Date | undefined;
  let lang_filter: string | undefined;

  // let params = $page.url.searchParams;
  // $: {
  //   allowed_categories_filter = JSON.parse(params.get("categories") ?? "[]");
  //   rating_filter = params.get("rating") !== null
  //       ? Number(params.get("rating")!)
  //       : undefined;
  //   start_filter =
  //     params.get("start_date") !== null
  //       ? new Date(params.get("start_date")!)
  //       : undefined;
  //   end_filter =
  //     params.get("end_date") !== null
  //       ? new Date(params.get("end_date")!)
  //       : undefined;
  //   lang_filter = $page.url.searchParams.get("lang") ?? "all";
  // }

  let sortingReversed = false;

  type sortOption =
    | "date_created"
    | "date_read"
    | "author"
    | "title"
    | "rating";
  let selectedSort: sortOption;

  let params = $page.url.searchParams;

  onMount(() => {
    let params = $page.url.searchParams;

    allowed_categories_filter = JSON.parse(params.get("categories") ?? "[]");
    rating_filter =
      params.get("rating") !== null ? Number(params.get("rating")!) : undefined;

    start_filter =
      params.get("start_date") !== null
        ? new Date(params.get("start_date")!)
        : undefined;
    start_filter?.setHours(0, 0, 0, 0); // time is not 00:00, UTC reasons

    end_filter =
      params.get("end_date") !== null
        ? new Date(params.get("end_date")!)
        : undefined;
    end_filter?.setHours(0, 0, 0, 0);

    lang_filter = params.get("lang") ?? "all";

    // if not type of sortOption, than sorting will just use the default, so no need to explicitly check here
    selectedSort = (params.get("sort") as sortOption) ?? "date_read";
    sortingReversed = (params.get("order") ?? "desc") == "desc";
  });

  const sortBooks = () => {
    // console.log(books_displayed);
    let params = $page.url.searchParams;
    params.set("order", sortingReversed ? "desc" : "asc");
    params.set("sort", selectedSort);

    goto("?" + params.toString(), {
      noScroll: true,
    });
    // replaceStateWithQuery({order: "desc"})

    // books_displayed = books_displayed.sort(
    //   (a, b) => cmpBooks(a, b) * (sortingReversed ? -1 : 1)
    // );

    $searchStore!.sort = (a: ReadingListItemType, b: ReadingListItemType) =>
      cmpBooks(a, b) * (sortingReversed ? -1 : 1);
  };

  const cmpBooks = (b1: ReadingListItemType, b2: ReadingListItemType) => {
    switch (selectedSort) {
      case "date_created":
        return b1.createdAt.getTime() - b2.createdAt.getTime();

      case "author":
        return b1.book.author.localeCompare(b2.book.author);

      case "title":
        return b1.book.name.localeCompare(b2.book.name);

      case "rating":
        return (b1.rating?.stars ?? 0) - (b2.rating?.stars ?? 0);

      case "date_read":
      default:
        return sortReadingActivity(b1, b2) * -1;
    }
  };

  // apply filter
  const filter = () => {
    // filter functions

    let f_rating = (b: ReadingListItemType) =>
      rating_filter === undefined ||
      Math.floor(b.rating?.stars ?? 0) == rating_filter;

    let f_start = (b: ReadingListItemType) => {
      const startDate =
        optionalToDate(b.dateStarted ?? b.dateFinished) ?? b.createdAt;

      return (
        start_filter === undefined ||
        (startDate != null && start_filter <= startDate)
      );
    };

    let f_end = (b: ReadingListItemType) => {
      const endDate =
        optionalToDate(b.dateFinished ?? b.dateStarted) ?? b.createdAt;
      return (
        end_filter === undefined || (endDate != null && end_filter >= endDate)
      );
    };

    let f_category = (b: ReadingListItemType) =>
      allowed_categories_filter === undefined ||
      allowed_categories_filter.length == 0 ||
      !!b.book.bookApiData?.categories.find(({ name: c }) =>
        allowed_categories_filter!.includes(c)
      );

    let f_lang = (b: ReadingListItemType) =>
      lang_filter === undefined ||
      lang_filter == "all" ||
      b.book.bookApiData?.language == lang_filter;

    let params = $page.url.searchParams;
    if (lang_filter !== undefined) {
      params.set("lang", lang_filter);
    }

    if (rating_filter !== undefined) {
      params.set("rating", rating_filter.toString());
    }

    if (start_filter !== undefined) {
      params.set("start_date", dateToYYYY_MM_DD(start_filter));
    }

    if (end_filter !== undefined) {
      params.set("end_date", dateToYYYY_MM_DD(end_filter));
    }

    if (
      allowed_categories_filter !== undefined &&
      allowed_categories_filter.length > 0
    ) {
      params.set("categories", JSON.stringify(allowed_categories_filter));
    }

    params.set("filter", "true");

    goto("?" + params.toString(), {
      noScroll: true,
    });

    $searchStore!.filter = (b: ReadingListItemType) =>
      f_rating(b) && f_lang(b) && f_category(b) && f_start(b) && f_end(b);
  };

  const resetFilter = () => {
    allowed_categories_filter = undefined;
    rating_filter = undefined;
    start_filter = undefined;
    end_filter = undefined;
    lang_filter = undefined;

    let params = $page.url.searchParams;
    let new_params = new URLSearchParams();
    new_params.set("filter", "true");

    if (params.get("q") !== undefined && params.get("q") !== null) {
      new_params.set("q", params.get("q")!);
    }

    if (params.get("order")) {
      new_params.set("order", params.get("order")!);
    }
    console.log(new_params);

    goto("?" + new_params.toString(), {
      noScroll: true,
    });
  };

  function parseDateInput(event: Event) {
    if (event.target !== null) {
      return new Date((event.target as HTMLDataElement).value);
    } else {
      return new Date(0);
    }
  }

  const filterMonth = (offset: number) => {
    start_filter = new Date();
    start_filter.setMonth(start_filter.getMonth() - offset);
    start_filter.setDate(1);
    start_filter?.setHours(0, 0, 0, 0);

    end_filter = new Date();
    end_filter.setMonth(end_filter.getMonth() - offset + 1); // one month to much
    end_filter.setDate(0); // => set to last day of previous month
    end_filter?.setHours(0, 0, 0, 0);
  };

  const filterLastMonth = () => {
    filterMonth(1);
  };

  const filterThisMonth = () => {
    filterMonth(0);
  };

  const filterYear = (offset: number) => {
    start_filter = new Date();
    start_filter.setFullYear(start_filter.getFullYear() - offset);
    start_filter.setDate(1);
    start_filter.setMonth(0);
    start_filter?.setHours(0, 0, 0, 0);

    end_filter = new Date();
    end_filter.setFullYear(end_filter.getFullYear() - offset);
    end_filter.setDate(0); // calculates last day
    end_filter.setMonth(11);
    end_filter?.setHours(0, 0, 0, 0);
  };

  const filterLastYear = () => {
    filterYear(1);
  };

  const filterThisYear = () => {
    filterYear(0);
  };
</script>

<div class="mt-4 mb-8">
  <div class="grid grid-cols-1 gap-6">
    <details
      class="flex flex-col"
      open={!!params.get("order") || !!params.get("sort")}>
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
        <select
          class="default-border border-red-600 border"
          bind:value={selectedSort}
          on:change={sortBooks}
          aria-label="Sort by">
          <option value="date_read">Sort by date</option>
          <option value="date_created">Sort by date created</option>
          <option value="title">Sort by title</option>
          <option value="author">Sort by author</option>
          <option value="rating">Sort by rating</option>
        </select>
        <SortOrder bind:reversed={sortingReversed} on:click={sortBooks} />
      </div>
    </details>

    <details class="flex flex-col" open={!!params.get("filter")}>
      <summary class="text-2xl">
        <div class="inline-flex items-center gap-2">
          Filter
          <span class="inline-block w-4">
            <FilterIcon />
          </span>
        </div>
      </summary>
      <div class="flex flex-col flex-wrap gap-2 mt-2 md:justify-between">
        <label class="flex flex-col" id="rating-label">
          <div class="flex gap-2">
            Rating ({rating_filter} / {MAX_RATING})
            <button
              class="btn-generic px-2 py-0"
              on:click={() => (rating_filter = undefined)}>
              clear
            </button>
          </div>
          <div class="my-2" hidden={true}>
            <!-- TODO -->
            <EqRelation />
          </div>
          <input
            type="range"
            min="0"
            max={MAX_RATING}
            bind:value={rating_filter}
            aria-labelledby="rating-label" />
        </label>

        <label class="flex flex-col">
          Languages
          <select class="default-border" bind:value={lang_filter}>
            <option value="all" selected>all</option>
            {#each languages_used as lang}
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
            className="!h-full" />
        </label>

        <label class="flex flex-col">
          Start date
          <input
            type="date"
            class="default-border"
            value={start_filter && dateToYYYY_MM_DD(start_filter)}
            on:change={(e) => (start_filter = parseDateInput(e))} />
        </label>

        <label class="flex flex-col">
          End date {end_filter && dateToYYYY_MM_DD(end_filter)}
          <input
            type="date"
            class="default-border"
            value={end_filter && dateToYYYY_MM_DD(end_filter)}
            on:change={(e) => (end_filter = parseDateInput(e))} />
        </label>

        <div class="flex justify-center gap-2">
          <button class="btn-generic" on:click={filterLastMonth}>
            Last month
          </button>
          <button class="btn-generic mr-2" on:click={filterThisMonth}>
            This month
          </button>
          <button class="btn-generic" on:click={filterLastYear}>
            Last year
          </button>
          <button class="btn-generic" on:click={filterThisYear}>
            This year
          </button>
        </div>
      </div>
      <div class="w-full md:w-fit flex gap-2 self-end mt-2">
        <button
          class="btn-secondary-black block my-3 px-8 text-center w-full md:w-fit"
          on:click={resetFilter}>
          Reset
        </button>
        <button
          class="btn-primary-black block my-3 px-8 text-center w-full md:w-fit"
          on:click={filter}>
          Filter
        </button>
      </div>
    </details>
  </div>
</div>
