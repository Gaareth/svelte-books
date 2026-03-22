<script lang="ts">
  import type { Prisma } from "$prismaBrowser";
  //@ts-ignore
  import IoIosStats from "svelte-icons/io/IoIosStats.svelte";

  import Charts from "$components/composed/Charts.svelte";
  import Book from "$lib/icons/book.svelte";
  import Pages from "$lib/icons/pages.svelte";
  import Words from "$lib/icons/words.svelte";
  import Modal from "$components/Modal.svelte";
  import Stats from "$components/composed/Stats.svelte";
  import {
    ACQUIRED,
    READING,
    READING_ACTIVITY_TYPES,
    TO_READ,
  } from "$lib/constants/enums";
  import ToggleGroup from "$components/input/ToggleGroup.svelte";
  import type { ReadingActivityList } from "$src/app";
  import {
    books_read_per_month,
    books_read_per_year,
    calc_most_read_authors,
    calc_most_read_categories,
    count_pages,
    count_words,
    get_average_acquisition_time,
    get_average_time_til_status,
    get_reading_duration,
  } from "$src/lib/utils/statisticUtils";
  import DynamicArrow from "$src/lib/icons/DynamicArrow.svelte";
  import { getReadingActivityColor } from "$src/lib/constants/constants";
  import { twMerge } from "tailwind-merge";
  import clsx from "clsx";

  type ActivityStatistics = ReadingActivityList;

  export let readingActivities: ActivityStatistics[] = [];

  // Derived reactive variables
  $: readingActivitiesFinished = readingActivities.filter(
    (a) => a.status?.status === READING_ACTIVITY_TYPES.FINISHED
  );

  $: most_read_categories = calc_most_read_categories(
    readingActivitiesFinished
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
  let showReadingDurationModal = false;

  let selected_option: "books" | "pages" | "words" = "books";

  $: now = new Date();

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

  $: most_read_authors = calc_most_read_authors(readingActivitiesFinished);

  // let reading_duration;
  $: reading_duration = get_reading_duration(readingActivities);
  $: reading_duration_histogram = reading_duration.histogram_ms.map(
    ([name, duration_ms]) =>
      [name, duration_ms / (1000 * 60 * 60 * 24)] as [string, number]
  ); // convert ms to days

  $: reading_duration_average_days = (
    reading_duration.averageDuration_ms /
    (1000 * 60 * 60 * 24)
  ).toFixed(2);
  $: reading_duration_total_days = (
    reading_duration.totalDuration_ms /
    (1000 * 60 * 60 * 24)
  ).toFixed(2);

  $: avg_acquisition_time = get_average_acquisition_time(readingActivities);
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

<div
  class="grid grid-rows-2 grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-2 stats-wrapper">
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

<div
  class="grid grid-rows-2 grid-cols-1 sm:grid-rows-1 sm:grid-cols-12 gap-2 mb-2">
  <Stats
    name="average reading time"
    class="!bg-transparent backdrop-blur col-span-full sm:col-span-5"
    showStatsButton={true}
    on:statsClick={() => (showReadingDurationModal = true)}>
    <p class="font-bold self-center text-5xl flex flex-col" slot="value">
      {reading_duration_average_days} days
      <span class="text-secondary text-base">
        {reading_duration_total_days} total days
      </span>
    </p>
  </Stats>

  <Stats
    name="average acquisition time (days)"
    class="!bg-transparent backdrop-blur sm:col-span-7">
    <div slot="value" class="flex flex-col w-full gap-1.5">
      <div class="flex items-end gap-3 justify-between break-keep">
        <p>To-Read</p>

        <div class="flex flex-col text-center">
          <p class="-mb-1 font-bold">
            {avg_acquisition_time.avg_to_read_to_acquired_days}
          </p>
          <div>
            <DynamicArrow
              minThickness={4}
              colorStart={getReadingActivityColor(TO_READ)}
              colorEnd={getReadingActivityColor(ACQUIRED)} />
          </div>
        </div>

        <p>Acquired</p>

        <div class="flex flex-col text-center">
          <p class="-mb-1 font-bold">
            {avg_acquisition_time.avg_acquired_to_reading_days}
          </p>
          <DynamicArrow
            minThickness={4}
            colorStart={getReadingActivityColor(ACQUIRED)}
            colorEnd={getReadingActivityColor(READING)} />
        </div>

        <p>Reading</p>
      </div>

      <div class="text-center">
        <p class="-mb-1 font-bold">
          {avg_acquisition_time.avg_to_read_to_reading_days}
        </p>
        <DynamicArrow
          maxThickness={1.5}
          colorStart={getReadingActivityColor(TO_READ)}
          colorEnd={getReadingActivityColor(READING)} />
      </div>
    </div>
  </Stats>
</div>

<div class="grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 gap-2">
  {#if readingActivitiesFinished.length > 0}
    <Stats
      name="most read author"
      value={most_read_authors[0][0] + " (" + most_read_authors[0][1] + ")"}
      class="!bg-transparent backdrop-blur"
      showStatsButton={true}
      on:statsClick={() => (showModalAuthors = true)} />
  {/if}
  {#if readingActivitiesFinished.length > 0 && most_read_categories[0] !== undefined}
    <Stats
      value={most_read_categories[0][0] +
        " (" +
        most_read_categories[0][1] +
        ")"}
      name="most read genre/category"
      showStatsButton={true}
      on:statsClick={() => (showModalCats = true)}
      class="!bg-transparent backdrop-blur" />
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

<Modal bind:showModal={showReadingDurationModal} className="w-[900px]">
  <div slot="header">
    <p class="font-medium sm:text-lg">Reading Duration</p>
  </div>

  <!-- TODO: format as hours if less than a day, or just add hours to days  -->
  <Charts data={reading_duration_histogram} label="days from start to finish" />
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
