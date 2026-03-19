<script lang="ts">
  import type { EventDispatcher } from "svelte";

  //@ts-ignore
  import IoIosArrowForward from "svelte-icons/io/IoIosArrowForward.svelte";

  import BookApiSkeleton from "./BookApiSkeleton.svelte";

  import type { queriedBook, ReadingActivityList } from "$appTypes";
  import { twMerge } from "tailwind-merge";
  import { getReadingActivityColor } from "$src/lib/constants/constants";
  import clsx from "clsx";
  import { capitalize, sortReadingActivity } from "$src/lib/utils/utils";

  export let readingActivities: ReadingActivityList[] = [];
  export let label: string;
  export let query: string | undefined = undefined;
  let queriedBooksPromise: Promise<queriedBook[]>;

  const queryBooks = async () => {
    let data = (await fetch(`/book/api/list/?query=${query}`)).json();
    return data.then((d) => {
      if (d.error !== undefined) {
        return Promise.reject(d.error);
      }

      return d;
    });

    // return data
  };

  const handleClick = async () => {
    queriedBooksPromise = queryBooks();
  };

  export let selectedBookId: string | undefined;
  export let apiBookSelected: boolean;
  export let dispatch: EventDispatcher<any>;

  //TODO: make tabbable, the radio button

  function findActivities(book: queriedBook) {
    return readingActivities.filter(
      (a) => a.book.name === book.volumeInfo.title
    );
  }

  function getColor(book: queriedBook) {
    let activity = findActivities(book).sort(sortReadingActivity)[0];

    if (activity?.status.status) {
      return getReadingActivityColor(activity.status.status);
    } else {
      return "";
    }
  }
</script>

<div {...$$restProps}>
  <label for="bookApiQuery" class="w-full text-lg">
    {label}
  </label>
  <form class="flex gap-2" on:submit|preventDefault={handleClick}>
    <input
      class="input btn-generic-color-2"
      type="text"
      id="bookApiQuery"
      bind:value={query} />

    <button
      type="submit"
      class="btn-primary-black"
      disabled={!query || query?.length === 0}>
      Search
    </button>
  </form>
  <div>
    {#if queriedBooksPromise !== undefined}
      {#await queriedBooksPromise}
        <BookApiSkeleton />
      {:then queriedBooks}
        {#each queriedBooks as book}
          <label
            style={`border-color: ${getColor(book)}`}
            class="item-border p-2 my-2 grid grid-cols-[1fr_auto] sm:flex justify-between items-center gap-1">
            <div class="flex items-center gap-4">
              <div>
                {#if book.volumeInfo.imageLinks?.smallThumbnail}
                  <img
                    src={book.volumeInfo.imageLinks.smallThumbnail}
                    alt="book cover"
                    class="w-10" />
                {:else}
                  <!-- ??TODO: placeholder -->
                  <img
                    src="/cover.png"
                    alt="placeholder book cover"
                    class="w-10" />
                {/if}
              </div>
              <div class="flex flex-col">
                <p class="text-base">
                  {book.volumeInfo.title}

                  {#if book.volumeInfo.subtitle}
                    ({book.volumeInfo.subtitle})
                  {/if}
                </p>
                <p class="text-base">
                  {book.volumeInfo.authors?.join(",") ?? "unknown author"}
                </p>
              </div>
            </div>

            <div class="flex gap-1 col-span-2 row-start-2">
              {#each findActivities(book) as activity}
                <p
                  style={`background-color: ${getColor(book)}`}
                  class="rounded-md text-sm font-medium px-1 text-white/90 uppercase">
                  {capitalize(activity.status.status)}
                </p>
              {/each}
            </div>

            <div class="flex items-center gap-2">
              <input
                type="radio"
                name="bookId"
                id={`bookId-${book.id}`}
                value={book.id}
                on:click={() => (selectedBookId = book.id)}
                class="mr-2 peer checked:hidden md:checked:block" />
              <button
                class="hidden peer-checked:flex px-3 py-1
                border rounded-md dark:border-slate-500 dark:bg-slate-600
                hover:bg-gray-50 dark:hover:bg-slate-500
                text-base flex-row items-center gap-1"
                on:click={() => {
                  console.log(dispatch);

                  apiBookSelected = true;
                  dispatch("select");
                }}
                title="Select book"
                type="button">
                <span class="hidden md:inline">Select</span>
                <span class="w-6 block">
                  <IoIosArrowForward />
                </span>
              </button>
            </div>
          </label>
        {/each}
      {:catch error}
        <p class="text-red-500 pt-1 text-sm">
          System error: {error.message}.
        </p>
      {/await}
    {/if}
  </div>
</div>
