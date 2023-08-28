<script lang="ts">
  import BookApiSkeleton from "./BookApiSkeleton.svelte";
  import { delay } from "$lib/utils";
  import type { queriedBookFull } from "../../routes/book/api/api.server";
  import IoIosArrowBack from "svelte-icons/io/IoIosArrowBack.svelte";
  import clsx from "clsx";
  import { browser } from "$app/environment";
  export let volumeId: string;
  export let apiBookSelected: boolean;

  export let getBookPromise: Promise<queriedBookFull> | undefined = undefined;
  $: {
    if (volumeId !== undefined && apiBookSelected) {
      getBookPromise = getBook(volumeId);
    }
  }

  async function getBook(id: string) {
    return (await fetch(`book/api/get/${id}`)).json();
  }

  let item_ref: HTMLElement | undefined = undefined;
  let flexWrapHappened: boolean | undefined = undefined;
  $: {
    if (item_ref) {
      flexWrapHappened = item_ref.clientHeight > 100;
    }
  }
  if (browser) {
    window.onresize = () => {
      if (item_ref) {
        flexWrapHappened = item_ref.clientHeight > 100;
      }
    };
  }
</script>

<button
  on:click={() => (apiBookSelected = false)}
  class="mt-5 flex flex-row items-center gap-1"
>
  <span class="block w-6">
    <IoIosArrowBack />
  </span>
  Back
</button>
{#if volumeId !== undefined && apiBookSelected && getBookPromise}
  {#await getBookPromise}
    <BookApiSkeleton />
  {:then book}
    {@const info = book.volumeInfo}
    {@const isbn_13 = info.industryIdentifiers.find(
      (t) => t.type == "ISBN_13"
    )?.identifier}
    {@const categories = info.categories?.join(" | ")}
    <div
      class="item-border p-2 my-2 flex flex-wrap items-center gap-4 relative"
      bind:this={item_ref}
    >
      <div class="flex items-center gap-4">
        <div>
          {#if info.imageLinks?.smallThumbnail}
            <img
              src={info.imageLinks.smallThumbnail}
              alt="book cover"
              class="w-10"
            />
          {:else}
            <img src="/cover.png" alt="placeholder book cover" class="w-10" />
          {/if}
        </div>

        <div class="flex flex-col">
          <p class="text-base">
            {info.title}
            {#if info.subtitle}
              ({info.subtitle})
            {/if}
          </p>
          <p class="text-base">
            {info.authors?.join(",") ?? "unknown author"}
          </p>
        </div>
      </div>
      <!-- <p>{categories?.length}</p> -->
      <!-- <p>{flexWrapHappened}</p>
      {#if item_ref}
        <p>{item_ref.clientHeight}</p>
      {/if} -->
      <div
        class={clsx(
          "api-stats flex gap-2 items-center flex-grow justify-between",
          !flexWrapHappened ? "md:justify-end" : ""
        )}
      >
        <div class="api-stats-cols">
          <span class="self-auto md:self-end">{info.pageCount} pages</span>
          <span>{categories}</span>
        </div>

        <div class="api-stats-cols">
          <span class="leading-4">{info.publisher}</span>
          <span class="leading-4">{info.publishedDate}</span>
        </div>

        <img
          class="w-5 absolute top-5 right-0 min-[500px]:static"
          src={`/language-icons/icons/${info.language}.svg`}
          alt={`${info.language} language icon`}
        />
        <span
          class="flex gap-1 items-center absolute top-0 right-0 !text-sm pr-1"
          hidden={isbn_13 === undefined}
        >
          {isbn_13}
        </span>
      </div>
    </div>
  {:catch error}
    <span>System error: {error.message}.</span>
  {/await}
{/if}

<style>
  .api-stats span {
    font-size: medium;
  }

  .api-stats-cols {
    display: flex;
    flex-direction: column;
  }

  .api-stats-cols span {
    line-height: 1rem;
  }
</style>
