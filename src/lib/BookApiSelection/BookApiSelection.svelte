<script lang="ts">
  import type { queriedBook } from "../../routes/book/api/api.server";
  import IoIosArrowForward from 'svelte-icons/io/IoIosArrowForward.svelte'
  import BookApiSkeleton from "./BookApiSkeleton.svelte";
  import { delay } from "$lib/utils";

  // const queryBooksDebug = async () => {
  //   return (await fetch(`book/api/list/?query="Der dunkle wald"`)).json();
  // };

  let query: string;
  let queriedBooksPromise: Promise<queriedBook[]>;

  const queryBooks = async () => {
    return (await fetch(`book/api/list/?query=${query}`)).json();
  };

  const handleClick = async () => {
    queriedBooksPromise = queryBooks();
    console.log(await queryBooks());
  };

  export let selectedBookId: string;
  export let apiBookSelected: boolean;

  //TODO: make tabbable, the radio button
</script>

<div {...$$restProps}>
  <div class="flex gap-2">
    <input
      class="input dark:bg-slate-600 dark:border-slate-500"
      type="text"
      bind:value={query}
    />
    <button class="btn-primary-black" on:click={handleClick}>Search</button>
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
                border rounded-lg dark:border-slate-500 dark:bg-slate-600
                hover:bg-gray-50 dark:hover:bg-slate-500
                text-base flex-row items-center gap-1"
                on:click={() => apiBookSelected = true}
                title="Select book"
              >
                <span class="hidden md:inline">Select</span> 
                <span class="w-6 block">
                  <IoIosArrowForward />
                </span>
              </button>
            </div>
          </label>
        {/each}
      {:catch someError}
        System error: {someError.message}.
      {/await}
    {/if}
  </div>
</div>
