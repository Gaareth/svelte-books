<script lang="ts">
  import type { EventDispatcher } from "svelte";

  import clsx from "clsx";
  //@ts-ignore
  import IoIosArrowBack from "svelte-icons/io/IoIosArrowBack.svelte";
  //@ts-ignore
  import IoMdOpen from "svelte-icons/io/IoMdOpen.svelte";

  import BookApiSkeleton from "./BookApiSkeleton.svelte";

  import type { queriedBookFull } from "$appTypes";

  import { browser } from "$app/environment";

  export let volumeId: string | undefined;
  export let apiBookSelected = true;
  export let back_button = true;
  export let dispatch: EventDispatcher<any> | undefined = undefined;

  export let getBookPromise: Promise<queriedBookFull> | undefined = undefined;

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

{#if back_button}
  <button
    on:click={() => {
      apiBookSelected = false;
      dispatch && dispatch("back");
    }}
    class="mt-5 flex flex-row items-center gap-1"
    type="button">
    <span class="block w-6">
      <IoIosArrowBack />
    </span>
    Back
  </button>
{/if}
{#if volumeId !== undefined && apiBookSelected && getBookPromise}
  {#await getBookPromise}
    <BookApiSkeleton />
  {:then book}
    {@const info = book.volumeInfo}
    {@const isbn_13 = info.industryIdentifiers?.find(
      (t) => t.type == "ISBN_13"
    )?.identifier}
    {@const categories = info.categories
      ? info.categories?.join(" | ")
      : "uncategorized"}
    <div
      class="item-border p-2 my-2 flex flex-wrap flex-col gap-2 relative"
      bind:this={item_ref}>
      <div class="flex items-center gap-4">
        <div>
          {#if info.imageLinks?.smallThumbnail}
            <img
              src={info.imageLinks.smallThumbnail}
              alt="book cover"
              class="w-10 max-w-[2.5rem]" />
          {:else}
            <img src="/cover.png" alt="placeholder book cover" class="w-10" />
          {/if}
        </div>

        <div class="flex flex-col">
          <p class="text-base flex items-center">
            {info.title}
            {#if info.subtitle}
              ({info.subtitle})
            {/if}
            <a
              class="pl-1"
              target="_blank"
              href="http://books.google.de/books?id={volumeId}"
              title="Open on books.google.de">
              <span class="w-4 h-4 block">
                <IoMdOpen />
              </span>
            </a>
          </p>
          <p class="text-base">
            {info.authors?.join(", ") ?? "unknown author"}
          </p>
        </div>
      </div>

      <p
        class="text-sm text-secondary line-clamp-2 hover:line-clamp-none -mt-1 -mb-1">
        {info.description ?? "No description available"}
      </p>

      <!-- <p>{categories?.length}</p> -->
      <!-- <p>{flexWrapHappened}</p>
      {#if item_ref}
        <p>{item_ref.clientHeight}</p>
      {/if} -->
      <div
        class={clsx(
          "api-stats flex gap-2 items-center flex-grow justify-between",
          !flexWrapHappened ? "md:justify-end" : ""
        )}>
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
          alt={`${info.language} language icon`} />
        {#if isbn_13}
          <span
            class="flex gap-1 items-center absolute top-0 right-0 !text-sm pr-1"
            title="ISBN 13">
            {isbn_13}
          </span>
        {/if}
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
