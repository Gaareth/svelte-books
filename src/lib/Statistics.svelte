<script lang="ts">
  import TabGroup from "./TabGroup.svelte";
  import type { BookFullType } from "../app";
  import Stats from "./Stats.svelte";
  import { sum } from "./utils";

  export let books: BookFullType[];
  export let most_read_category: [string, number];

  let books_with_pagecount = books
    .map((b) => b.bookApiData?.pageCount)
    .filter((pc) => pc != null);
  let num_pages = books_with_pagecount.reduce((c1, c2) => c1 + c2);
  let pagecount_accuracy = books_with_pagecount.length / books.length;

  const AVERAGE_NUM_WORDS_PER_PAGE = 250;
  let books_with_words = books.filter(
    (b) => b.bookApiData?.pageCount != null && b.wordsPerPage != null
  );
  let num_words = books
    .filter((b) => b.bookApiData?.pageCount != null)
    .map(
      (b) =>
        (b.wordsPerPage ?? AVERAGE_NUM_WORDS_PER_PAGE) *
        b.bookApiData?.pageCount!
    )
    .reduce((c1, c2) => c1 + c2);
  let wordcount_accuracy = books_with_words.length / books.length;

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

  let books_last_month: BookFullType[] = books_read_per_month(now.getMonth());

  let books_read_per_year = (year: number): BookFullType[] => {
    return books.filter((b) => b.yearRead == year);
  };

  let books_this_year: BookFullType[] = books_read_per_year(now.getFullYear());

  let books_last_year: BookFullType[] = books_read_per_year(
    now.getFullYear() - 1
  );

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

  let selected_option = "books";
</script>

<select
  bind:value={selected_option}
  class="rounded mb-1 dark:!bg-slate-800 dark:border-slate-700"
>
  <option value="books">books</option>
  <option value="pages">pages</option>
  <option value="words">words</option>
</select>

<div
  class="grid gap-3 sm:grid-flow-col1 grid-cols-2 sm:grid-cols-4 grid-rows-2 sm:grid-rows-1 stats-wrapper"
>
  {#if selected_option == "books"}
    <Stats name="total books read" value={books.length}></Stats>
  {:else if selected_option == "pages"}
    <Stats name="total pages read">
      <div slot="value" class="flex gap-1 items-center">
        <p class="text-4xl font-bold self-center">
          {num_pages.toLocaleString("en-US")}
        </p>
        {#if pagecount_accuracy < 1}
          <div>
            <span>{pagecount_accuracy * 100}%</span>
          </div>
        {/if}
      </div>
    </Stats>
  {:else}
    <Stats name="total words read">
      <div slot="value" class="flex flex-wrap gap-1 items-center">
        <p class="text-2xl font-bold self-center break-all">
          {num_words.toLocaleString("en-US")}
        </p>
        {#if wordcount_accuracy < 1}
          <div>
            <span>{wordcount_accuracy * 100}%</span>
          </div>
        {/if}
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
      value={sum(
        books_this_month
          .filter((b) => b.bookApiData?.pageCount != null)
          .map((b) => b.bookApiData?.pageCount)
      )}
      last_value={books_last_month.length}
    />
  {:else}
    <Stats
      name="words read this month"
      value={sum(
        books_this_month
          .filter((b) => b.bookApiData?.pageCount != null)
          .map(
            (b) =>
              b.bookApiData?.pageCount *
              (b.wordsPerPage ?? AVERAGE_NUM_WORDS_PER_PAGE)
          )
      )}
      last_value={books_last_month.length}
    />
  {/if}

  {#if books_last_year.length > 0}
    <Stats
      name="books read this year"
      value={books_this_year.length}
      last_value={books_last_year.length}
    />
  {/if}

  {#if books.length > 0}
    <Stats
      name="most read author"
      value={most_read_author()}
      class="col-span-2"
    />
  {/if}
  {#if books.length > 0 && most_read_category[0] !== undefined}
    <Stats
      name="most read genre/category"
      value={most_read_category[0] + " (" + most_read_category[1] + ")"}
      class="col-span-2"
    />
  {/if}
</div>

<!-- <style>
  /* @media screen and (max-width: 640px) {
    .stats-wrapper {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  } */
</style> -->
