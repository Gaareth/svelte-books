<script lang="ts">
  import type { Prisma } from "$prismaBrowser";
  //@ts-ignore
  import IoIosStats from "svelte-icons/io/IoIosStats.svelte";
  import { twMerge } from "tailwind-merge";

  import Charts from "./Charts.svelte";
  import Book from "./icons/book.svelte";
  import Pages from "./icons/pages.svelte";
  import Words from "./icons/words.svelte";
  import Modal from "./Modal.svelte";
  import Stats from "./Stats.svelte";
  import { sum } from "./utils";
  import { READING_ACTIVITY_TYPES } from "./constants/enums";
  import ToggleGroup from "./ToggleGroup.svelte";

  type ActivityStatistics = Prisma.ReadingActivityGetPayload<{
    include: {
      status: true;
      dateStarted: true;
      dateFinished: true;
      rating: true;
      book: {
        include: {
          bookList: true;
          bookApiData: {
            include: {
              categories: true;
            };
          };
        };
      };
    };
  }>;

  export let readingActivities: ActivityStatistics[] = [];

  // Derived reactive variables
  $: readingActivitiesFinished = readingActivities.filter(
    (a) => a.status?.status === READING_ACTIVITY_TYPES.FINISHED
  );

  function calc_most_read_categories(
    entries: ActivityStatistics[]
  ): [string, number][] {
    const category_count_map = new Map<string, number>();
    entries.forEach((entry) => {
      entry.book.bookApiData?.categories.forEach(({ name }) => {
        category_count_map.set(name, (category_count_map.get(name) || 0) + 1);
      });
    });
    return Array.from(category_count_map).sort(([, a], [, b]) => b - a);
  }

  $: most_read_categories = calc_most_read_categories(
    readingActivitiesFinished
  );

  const AVERAGE_NUM_WORDS_PER_PAGE = 250;
  const AVERAGE_NUM_PAGES_PER_BOOK = 350;

  const count_pages = (entries: ActivityStatistics[]) =>
    sum(
      entries.map(
        (e) => e.book.bookApiData?.pageCount ?? AVERAGE_NUM_PAGES_PER_BOOK
      )
    );

  const count_words = (entries: ActivityStatistics[]) =>
    sum(
      entries.map(
        (e) =>
          (e.book.bookApiData?.pageCount ?? AVERAGE_NUM_PAGES_PER_BOOK) *
          (e.book.wordsPerPage ?? AVERAGE_NUM_WORDS_PER_PAGE)
      )
    );

  $: books_without_pagecount = readingActivitiesFinished.filter(
    (e) => e.book.bookApiData?.pageCount == null
  );
  $: books_without_words = readingActivitiesFinished.filter(
    (e) => e.book.bookApiData?.pageCount == null || e.book.wordsPerPage == null
  );

  $: num_pages = count_pages(readingActivitiesFinished);
  $: pagecount_accuracy =
    readingActivitiesFinished.length === 0
      ? 0
      : 1 - books_without_pagecount.length / readingActivitiesFinished.length;

  $: num_words = count_words(readingActivitiesFinished);
  $: wordcount_accuracy =
    readingActivitiesFinished.length === 0
      ? 0
      : 1 - books_without_words.length / readingActivitiesFinished.length;

  let showModal = false;
  let showModalCats = false;
  let showModalAuthors = false;
  let selected_option: "books" | "pages" | "words" = "books";

  $: now = new Date();

  const books_read_per_month = (
    month: number,
    year: number,
    activities: ActivityStatistics[]
  ) =>
    activities.filter(
      (e) =>
        e.dateFinished?.year === year &&
        e.dateFinished?.month !== null &&
        e.dateFinished.month === (month === 0 ? 12 : month)
    );

  $: books_this_month = books_read_per_month(
    now.getMonth() + 1,
    now.getFullYear(),
    readingActivitiesFinished
  );
  $: books_last_month = books_read_per_month(
    now.getMonth(),
    now.getFullYear(),
    readingActivitiesFinished
  );

  $: pages_this_month = count_pages(books_this_month);
  $: words_this_month = count_words(books_this_month);

  $: pages_last_month = count_pages(books_last_month);
  $: words_last_month = count_words(books_last_month);

  const books_read_per_year = (
    year: number,
    activities: ActivityStatistics[]
  ) => activities.filter((e) => e.dateFinished?.year === year);

  $: books_this_year = books_read_per_year(
    now.getFullYear(),
    readingActivitiesFinished
  );
  $: books_last_year = books_read_per_year(
    now.getFullYear() - 1,
    readingActivitiesFinished
  );
  $: pages_this_year = count_pages(books_this_year);
  $: words_this_year = count_words(books_this_year);
  $: pages_last_year = count_pages(books_last_year);
  $: words_last_year = count_words(books_last_year);

  const calc_most_read_authors = (entries: ActivityStatistics[]) => {
    const author_occur: Record<string, number> = {};
    entries.forEach((e) => {
      const author = e.book.author;
      author_occur[author] = (author_occur[author] || 0) + 1;
    });
    return Object.entries(author_occur).sort(([, a], [, b]) => b - a);
  };

  $: most_read_authors = calc_most_read_authors(readingActivitiesFinished);
</script>

<div
  class="flex flex-col sm:flex-row gap-1 sm:gap-5 mb-1 items-center sm:h-12 sm:overflow-hidden">
  <ToggleGroup
    options={["books", "pages", "words"]}
    groupClass="inline-flex"
    btnClass="px-4 py-1 border border-s-0 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 flex items-center gap-1"
    btnSelectedClass="dark:bg-slate-700 bg-gray-50"
    startClass="border-s rounded-s-md"
    endClass="rounded-e-md"
    bind:selectedOption={selected_option}>
    <svelte:fragment slot="default" let:option>
      {#if option == "books"}
        <span class="w-5"><Book /></span>
        books
      {:else if option == "pages"}
        <span class="w-5"><Pages /></span>
        pages
      {:else}
        <span class="w-5"><Words /></span>
        words
      {/if}
    </svelte:fragment>
  </ToggleGroup>

  <div class="text-secondary text-base">
    {#if selected_option == "pages" && pagecount_accuracy < 1}
      <div class="-mb-1">{(pagecount_accuracy * 100).toFixed(2)}% Accuracy</div>
      <div>
        {books_without_pagecount.length} books without pagecount. See
        <button class="!text-base link-all" on:click={() => (showModal = true)}>
          all
        </button>
      </div>
    {:else if selected_option == "words" && wordcount_accuracy < 1}
      <div class="-mb-1">{(wordcount_accuracy * 100).toFixed(2)}% Accuracy</div>
      <div>
        {books_without_words.length} books without words per page info. See
        <button class="!text-base link-all" on:click={() => (showModal = true)}>
          all
        </button>
      </div>
    {/if}
  </div>
</div>

<Modal bind:showModal>
  <div slot="header">
    <p class="font-medium sm:text-lg">
      {#if selected_option == "pages"}
        Books without page count
      {:else}
        Books without words per page info
      {/if}
    </p>
  </div>
  <ul class="list-disc p-2 sm:w-[30rem]">
    {#each selected_option == "pages" ? books_without_pagecount : books_without_words as entry}
      <li>
        <a href={`/book/${entry.book.name}?edit=true`} class="hover:underline">
          {entry.book.name}
        </a>
      </li>
    {/each}
  </ul>
</Modal>

<div class="flex flex-wrap gap-1 sm:gap-2 mb-2 stats-wrapper">
  {#if selected_option == "books"}
    <Stats
      name="total books read"
      value={readingActivitiesFinished.length}
      class="!bg-transparent backdrop-blur" />
  {:else if selected_option == "pages"}
    <Stats name="total pages read" class="!bg-transparent backdrop-blur">
      <div slot="value" class="flex gap-1 items-center">
        <p class="text-4xl font-bold self-center">
          {num_pages.toLocaleString("en-US")}
        </p>
      </div>
    </Stats>
  {:else}
    <Stats name="total words read" class="!bg-transparent backdrop-blur">
      <div slot="value" class="flex flex-wrap gap-1 items-center">
        <p class="text-3xl font-bold self-center break-all">
          {num_words.toLocaleString("en-US")}
        </p>
      </div>
    </Stats>
  {/if}

  {#if selected_option == "books"}
    <Stats
      name="books read this month"
      value={books_this_month.length}
      last_value={books_last_month.length}
      class="!bg-transparent backdrop-blur" />
  {:else if selected_option == "pages"}
    <Stats
      name="pages read this month"
      value={pages_this_month}
      last_value={pages_last_month}
      class="!bg-transparent backdrop-blur" />
  {:else}
    <Stats
      name="words read this month"
      value={words_this_month}
      last_value={words_last_month}
      class="!bg-transparent backdrop-blur" />
  {/if}

  {#if books_last_year.length > 0 || true}
    {#if selected_option == "books"}
      <Stats
        name="books read this year"
        value={books_this_year.length}
        last_value={books_last_year.length}
        class="!bg-transparent backdrop-blur" />
    {:else if selected_option == "pages"}
      <Stats
        name="pages read this year"
        value={pages_this_year}
        last_value={pages_last_year}
        class="!bg-transparent backdrop-blur" />
    {:else}
      <Stats
        name="words read this year"
        value={words_this_year}
        last_value={words_last_year}
        class="!bg-transparent backdrop-blur" />
    {/if}
  {/if}
</div>

<div class="grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 gap-2">
  {#if readingActivitiesFinished.length > 0}
    <Stats
      value={most_read_authors[0][0] + " (" + most_read_authors[0][1] + ")"}
      class="!bg-transparent backdrop-blur">
      <div class="flex justify-between" slot="name">
        <p class="text-gray-500 dark:text-gray-400 text-base">
          most read author
        </p>
        <button
          class="border rounded p-1 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
          on:click={() => (showModalAuthors = true)}>
          <span class="w-5 block"><IoIosStats /></span>
        </button>
      </div>
    </Stats>
  {/if}
  {#if readingActivitiesFinished.length > 0 && most_read_categories[0] !== undefined}
    <Stats
      value={most_read_categories[0][0] +
        " (" +
        most_read_categories[0][1] +
        ")"}
      class="!bg-transparent backdrop-blur">
      <div class="flex justify-between" slot="name">
        <p class="text-gray-500 dark:text-gray-400 text-base">
          most read genre/category
        </p>
        <button
          class="border rounded p-1 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
          on:click={() => (showModalCats = true)}>
          <span class="w-5 block"><IoIosStats /></span>
        </button>
      </div>
    </Stats>
  {/if}
</div>

<Modal bind:showModal={showModalCats} className="w-[900px]">
  <div slot="header">
    <p class="font-medium sm:text-lg">Most read categories</p>
  </div>

  <Charts data={most_read_categories} />
</Modal>

<Modal bind:showModal={showModalAuthors} className="w-[900px]">
  <div slot="header">
    <p class="font-medium sm:text-lg">Most read authors</p>
  </div>

  <Charts data={most_read_authors} />
</Modal>

<!-- <style>
  /* @media screen and (max-width: 640px) {
    .stats-wrapper {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  } */
</style> -->

<style lang="postcss">
  .link-all {
    @apply text-slate-600 dark:text-slate-300 hover:underline;
  }
</style>
