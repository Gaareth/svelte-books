<script lang="ts">
	import { page } from '$app/stores';
  //@ts-ignore
  import IoIosArrowForward from "svelte-icons/io/IoIosArrowForward.svelte";
  import BookApiSkeleton from "./BookApiSkeleton.svelte";
  import { delay } from "$lib/utils";
  import type { queriedBook } from "$appTypes";
  import type { EventDispatcher } from "svelte";

  // const queryBooksDebug = async () => {
  //   return (await fetch(`book/api/list/?query="Der dunkle wald"`)).json();
  // };

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
    // console.log(await queryBooks()); // TODO: remove
  };

  export let selectedBookId: string | undefined;
  export let apiBookSelected: boolean;
  export let dispatch: EventDispatcher<any>;

  //TODO: make tabbable, the radio button
</script>

<div {...$$restProps}>
  <div class="flex gap-2">
    <input
      class="input dark:bg-slate-600 dark:border-slate-500"
      type="text"
      bind:value={query}
    />
    <button type="button" class="btn-primary-black" on:click={handleClick}
      >Search</button
    >
  </div>
  <div>
    {#if queriedBooksPromise !== undefined}
      {#await queriedBooksPromise}
        <BookApiSkeleton />
      {:then queriedBooks}
        {#each queriedBooks as book}
          <label class="item-border p-2 my-2 flex justify-between items-center">
            <div class="flex items-center gap-4">
              <div>
                {#if book.volumeInfo.imageLinks?.smallThumbnail}
                  <img
                    src={book.volumeInfo.imageLinks.smallThumbnail}
                    alt="book cover"
                    class="w-10"
                  />
                {:else}
                  <!-- ??TODO: placeholder -->
                  <img
                    src="/cover.png"
                    alt="placeholder book cover"
                    class="w-10"
                  />
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
            <div class="flex items-center gap-2">
              <input
                type="radio"
                name="bookId"
                id={`bookId-${book.id}`}
                value={book.id}
                on:click={() => (selectedBookId = book.id)}
                class="mr-2 peer checked:hidden md:checked:block"
              />
              <button
                class="hidden peer-checked:flex px-3 py-1
                border rounded-md dark:border-slate-500 dark:bg-slate-600
                hover:bg-gray-50 dark:hover:bg-slate-500
                text-base flex-row items-center gap-1"
                on:click={() => {
                  apiBookSelected = true;
                  dispatch("select");
                }}
                title="Select book"
                type="button"
              >
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
