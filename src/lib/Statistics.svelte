<script lang="ts">
  import { Prisma } from "@prisma/client";
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

  //@ts-ignore

  import { READING_STATUS } from "$appTypes";
  type ActivityStatistics = Prisma.ReadingActivityGetPayload<{
    include: {
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
  export let readingActivities: ActivityStatistics[];
  readingActivities = readingActivities.filter(
    (a) => a.status == READING_STATUS.FINISHED
  );

  function calc_most_read_categories(
    entry: ActivityStatistics[]
  ): [string, number][] {
    const category_count_map = new Map<string, number>();

    // Count each category across all books
    entry.forEach((entry: ActivityStatistics) => {
      entry.book.bookApiData?.categories.forEach(({ name: category_name }) => {
        category_count_map.set(
          category_name,
          (category_count_map.get(category_name) || 0) + 1
        );
      });
    });

    // Convert the map to an array of tuples and sort by count in descending order
    return Array.from(category_count_map).sort(
      ([, countA], [, countB]) => countB - countA
    );
  }

  const most_read_categories: [string, number][] =
    calc_most_read_categories(readingActivities);

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

  let books_without_pagecount = readingActivities.filter(
    (e) => e.book.bookApiData?.pageCount == null
  );

  let num_pages = count_pages(readingActivities);
  let pagecount_accuracy =
    1 - books_without_pagecount.length / readingActivities.length;

  let books_without_words = readingActivities.filter(
    (e) => e.book.bookApiData?.pageCount == null || e.book.wordsPerPage == null
  );
  let num_words = count_words(readingActivities);
  let wordcount_accuracy =
    1 - books_without_words.length / readingActivities.length;

  let showModal = false;
  let booksMissingList = [];

  let now = new Date();

  let books_read_per_month = (month: number): ActivityStatistics[] => {
    month = month == 0 ? 12 : month;
    return readingActivities.filter(
      (e) =>
        e.dateFinished?.year == now.getFullYear() &&
        e.dateFinished.month !== null &&
        e.dateFinished.month == month
    );
  };

  let books_this_month: ActivityStatistics[] = books_read_per_month(
    now.getMonth() + 1
  );

  let pages_this_month = count_pages(books_this_month);
  let words_this_month = count_words(books_this_month);

  let books_last_month: ActivityStatistics[] = books_read_per_month(
    now.getMonth()
  );
  let pages_last_month = count_pages(books_last_month);
  let words_last_month = count_words(books_last_month);

  let books_read_per_year = (year: number): ActivityStatistics[] => {
    return readingActivities.filter((e) => e.dateFinished?.year == year);
  };

  let books_this_year: ActivityStatistics[] = books_read_per_year(
    now.getFullYear()
  );
  let pages_this_year = count_pages(books_this_year);
  let words_this_year = count_words(books_this_year);

  let books_last_year: ActivityStatistics[] = books_read_per_year(
    now.getFullYear() - 1
  );
  let pages_last_year = count_pages(books_last_year);
  let words_last_year = count_words(books_last_year);

  let calc_most_read_authors = (entries: ActivityStatistics[]) => {
    let authors = entries.map((e) => e.book.author);
    let author_occur: { [key: string]: number } = {};
    authors.forEach((a: string) =>
      author_occur[a] ? ++author_occur[a] : (author_occur[a] = 1)
    );

    var sortedArray = Object.entries(author_occur).sort(
      ([, a], [, b]) => b - a
    );
    return sortedArray;
  };
  $: most_read_authors = calc_most_read_authors(readingActivities);

  let selected_option: "books" | "pages" | "words" = "books";

  let showModalCats = false;
  let showModalAuthors = false;
</script>

<div
  class="flex flex-col sm:flex-row gap-1 sm:gap-5 mb-1 items-center sm:h-12 sm:overflow-hidden">
  <div class="btn-group dark:border-slate-700">
    <button
      class={twMerge(
        "btn-group-btn flex items-center gap-1",
        selected_option == "books" && "btn-group-selected"
      )}
      on:click={() => (selected_option = "books")}>
      <span class="w-5"><Book /></span>
      books
    </button>
    <button
      class={twMerge(
        "btn-group-btn flex items-center gap-1",
        selected_option == "pages" && "btn-group-selected"
      )}
      on:click={() => (selected_option = "pages")}>
      <span class="w-5"><Pages /></span>
      pages
    </button>
    <button
      class={twMerge(
        "btn-group-btn flex items-center gap-1",
        selected_option == "words" && "btn-group-selected"
      )}
      on:click={() => (selected_option = "words")}>
      <span class="w-5"><Words /></span>
      words
    </button>
  </div>
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
        <a href="book/{entry.book.name}?edit=true" class="hover:underline">
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
      value={readingActivities.length}
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

  {#if books_last_year.length > 0}
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
  {#if readingActivities.length > 0}
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
  {#if readingActivities.length > 0 && most_read_categories[0] !== undefined}
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
  .btn-group-btn {
    @apply dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700;
  }

  .btn-group-selected {
    @apply dark:bg-slate-700 bg-gray-50;
  }

  .link-all {
    @apply text-slate-600 dark:text-slate-300 hover:underline;
  }
</style>
