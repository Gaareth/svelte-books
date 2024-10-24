<script lang="ts">
  import Modal from "./Modal.svelte";
  import { page } from "$app/stores";
  import { twMerge } from "tailwind-merge";
  import TabGroup from "./TabGroup.svelte";
  import type { BookFullType } from "../app";
  import Stats from "./Stats.svelte";
  import { sum } from "./utils";
  import Book from "./icons/book.svelte";
  import Pages from "./icons/pages.svelte";
  import Words from "./icons/words.svelte";

  export let books: BookFullType[];
  export let most_read_category: [string, number];

  const AVERAGE_NUM_WORDS_PER_PAGE = 250;
  const AVERAGE_NUM_PAGES_PER_BOOK = 350;

  const count_pages = (books: BookFullType[]) =>
    sum(
      books.map((b) => b.bookApiData?.pageCount ?? AVERAGE_NUM_PAGES_PER_BOOK)
    );

  const count_words = (books: BookFullType[]) =>
    sum(
      books.map(
        (b) =>
          (b.bookApiData?.pageCount ?? AVERAGE_NUM_PAGES_PER_BOOK) *
          (b.wordsPerPage ?? AVERAGE_NUM_WORDS_PER_PAGE)
      )
    );

  let books_without_pagecount = books
    .map((b) => b.bookApiData?.pageCount)
    .filter((pc) => pc == null);
  let num_pages = count_pages(books);
  let pagecount_accuracy = 1 - books_without_pagecount.length / books.length;

  let books_without_words = books.filter(
    (b) => b.bookApiData?.pageCount == null || b.wordsPerPage == null
  );
  let num_words = count_words(books);
  let wordcount_accuracy = 1 - books_without_words.length / books.length;

  let showModal = false;
  let booksMissingList = [];

  let now = new Date();

  let books_read_per_month = (month: number): BookFullType[] => {
    month = month == 0 ? 12 : month;
    return books.filter(
      (b) =>
        b.yearRead == now.getFullYear() &&
        b.monthRead !== null &&
        b.monthRead == month
    );
  };

  let books_this_month: BookFullType[] = books_read_per_month(
    now.getMonth() + 1
  );
  let pages_this_month = count_pages(books_this_month);
  let words_this_month = count_words(books_this_month);

  let books_last_month: BookFullType[] = books_read_per_month(now.getMonth());
  let pages_last_month = count_pages(books_last_month);
  let words_last_month = count_words(books_last_month);

  let books_read_per_year = (year: number): BookFullType[] => {
    return books.filter((b) => b.yearRead == year);
  };

  let books_this_year: BookFullType[] = books_read_per_year(now.getFullYear());
  let pages_this_year = count_pages(books_this_year);
  let words_this_year = count_words(books_this_year);

  let books_last_year: BookFullType[] = books_read_per_year(
    now.getFullYear() - 1
  );
  let pages_last_year = count_pages(books_last_year);
  let words_last_year = count_words(books_last_year);

  let most_read_author = () => {
    let authors = books.map((b) => b.author);
    let author_occur: { [key: string]: number } = {};
    authors.forEach((a: string) =>
      author_occur[a] ? ++author_occur[a] : (author_occur[a] = 1)
    );

    var sortedArray = Object.entries(author_occur).sort(
      ([, a], [, b]) => a - b
    );
    const entry: [string, number] = sortedArray[sortedArray.length - 1];
    const author_string = `${entry[0]} (${entry[1]})`;
    return author_string;
  };

  let selected_option: "books" | "pages" | "words" = "books";
</script>

<div class="flex gap-5 items-center">
  <div class="btn-group mb-1 dark:border-slate-700">
    <button
      class={twMerge(
        "btn-group-btn flex items-center gap-1",
        selected_option == "books" && "btn-group-selected"
      )}
      on:click={() => (selected_option = "books")}
    >
      <span><Book /></span>books
    </button>
    <button
      class={twMerge(
        "btn-group-btn flex items-center gap-1",
        selected_option == "pages" && "btn-group-selected"
      )}
      on:click={() => (selected_option = "pages")}
    >
      <span><Pages /></span>pages
    </button>
    <button
      class={twMerge(
        "btn-group-btn flex items-center gap-1",
        selected_option == "words" && "btn-group-selected"
      )}
      on:click={() => (selected_option = "words")}
    >
      <span><Words /></span>words
    </button>
  </div>
  <div class="text-secondary text-base">
    {#if selected_option == "pages" && pagecount_accuracy < 1}
      <p>{(pagecount_accuracy * 100).toFixed(2)}% Accuracy</p>
      <p>{books_without_pagecount.length} books without pagecount</p>
    {:else if selected_option == "words" && wordcount_accuracy < 1}
      <div class="-mb-1">{(wordcount_accuracy * 100).toFixed(2)}% Accuracy</div>
      <div>
        {books_without_words.length} books without words per page info. See
        <button
          class="!text-base hover:underline"
          on:click={() => (showModal = true)}>all</button
        >
      </div>
    {/if}
  </div>
</div>

<Modal bind:showModal>
  <div class="" slot="header">
    <p class="font-medium sm:text-lg">Books without words per page info</p>
  </div>
  <ul class="list-disc p-2 sm:w-[30rem]">
    {#each books_without_words as book}
      <li>
        <a href="book/{book.name}?edit=true" class="hover:underline"
          >{book.name}</a
        >
      </li>
    {/each}
  </ul>
</Modal>

<div class="flex flex-wrap gap-1 stats-wrapper">
  {#if selected_option == "books"}
    <Stats name="total books read" value={books.length}></Stats>
  {:else if selected_option == "pages"}
    <Stats name="total pages read">
      <div slot="value" class="flex gap-1 items-center">
        <p class="text-4xl font-bold self-center">
          {num_pages.toLocaleString("en-US")}
        </p>
      </div>
    </Stats>
  {:else}
    <Stats name="total words read">
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
    />
  {:else if selected_option == "pages"}
    <Stats
      name="pages read this month"
      value={pages_this_month}
      last_value={pages_last_month}
    />
  {:else}
    <Stats
      name="words read this month"
      value={words_this_month}
      last_value={words_last_month}
    />
  {/if}

  {#if books_last_year.length > 0}
    {#if selected_option == "books"}
      <Stats
        name="books read this year"
        value={books_this_year.length}
        last_value={books_last_year.length}
      />
    {:else if selected_option == "pages"}
      <Stats
        name="pages read this year"
        value={pages_this_year}
        last_value={pages_last_year}
      />
    {:else}
      <Stats
        name="words read this year"
        value={words_this_year}
        last_value={words_last_year}
      />
    {/if}
  {/if}
</div>

<div class="grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 gap-1 mt-1">
  {#if books.length > 0}
    <Stats name="most read author" value={most_read_author()} />
  {/if}
  {#if books.length > 0 && most_read_category[0] !== undefined}
    <Stats
      name="most read genre/category"
      value={most_read_category[0] + " (" + most_read_category[1] + ")"}
    />
  {/if}
</div>

<style lang="postcss">
  .btn-group-btn {
    @apply dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700;
  }

  .btn-group-selected {
    @apply dark:bg-slate-700 bg-gray-50;
  }
</style>

<!-- <style>
  /* @media screen and (max-width: 640px) {
    .stats-wrapper {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  } */
</style> -->

 
