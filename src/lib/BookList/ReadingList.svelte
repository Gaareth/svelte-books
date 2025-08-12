<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import { fade, scale } from "svelte/transition";
  import BookSearch from "../BookSearch.svelte";

  import type { BookFullType, ReadingListItemType } from "$appTypes";
  import { createSearchStore, searchHandler } from "$lib/stores/search";
  import type { Book } from "@prisma/client";
  import { onDestroy } from "svelte";
  import { flip } from "svelte/animate";
  import type { ItemDeleteEvent } from "./ReadingListItem.svelte";
  import BookListItem from "./ReadingListItem.svelte";

  //@ts-ignore
  import MoreIcon from "svelte-icons/io/IoMdMore.svelte";

  import Filtering from "./Filtering.svelte";
  import { page } from "$app/stores";
  import ReadingListItem from "./ReadingListItem.svelte";

  export let entries: ReadingListItemType[];
  export let showSearch = true;

  const searchStore = createSearchStore(entries);
  let added_book = false;

  let languages_used: string[];
  let category_names: string[] = [
    ...new Set(
      entries
        .map((b) => b.book.bookApiData?.categories.map((c) => c.name))
        .flat()
        .filter((n) => n != null)
    ),
  ];

  $: {
    added_book = true;
    $searchStore.data = entries;
    languages_used = entries.reduce((result, b) => {
      let lang = b.book.bookApiData?.language;
      if (lang !== undefined && !result.includes(lang)) {
        return result.concat(lang);
      }
      return result;
    }, [] as string[]);
  }

  $: books_displayed = $searchStore.filtered;

  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));
  onDestroy(() => {
    unsubscribe();
  });

  let deletionBook: Book;
  let openModal = false;

  let showOptions = false;
  $: {
    let params = $page.url.searchParams;
    showOptions =
      (!!params.get("filter") ||
        !!params.get("sort") ||
        !!params.get("order")) ??
      false;
  }

  const animate = (node: any, args: any) => {
    const animation = added_book
      ? scale(node, args)
      : fade(node, { duration: 0, delay: 0 });
    added_book = false;
    return animation;
  };

  const openPopup = (event: CustomEvent<ItemDeleteEvent>) => {
    openModal = true;
    deletionBook = event.detail.book;
  };
</script>

<div class="flex justify-between mt-8 mb-2 sm:flex-row flex-col">
  <h2 class="flex items-end text-2xl -mb-1 {showOptions ? 'invisible' : ''}">
    Books
  </h2>
  <div class="flex gap-1 sm:gap-2">
    {#if entries.length > 0 && showSearch}
      <BookSearch bind:search_term={$searchStore.search} />
      <button
        class="btn-generic-icon ml-auto"
        on:click={() => (showOptions = !showOptions)}
      >
        <span class="w-5 block">
          <MoreIcon />
        </span>
      </button>
    {/if}
    <!-- <Dropdown
      buttonClass="btn-generic-icon"
      contentClass="!border-0 !p-0 !bg-transparent"
    >
      <span class="w-5 block" slot="triggerContent">
        <MoreIcon />
      </span>

      <div
        slot="dropdown"
        class="max-w-96 w-auto p-3 border rounded-md dark:border-slate-500 dark:bg-slate-700 flex flex-col bg-white"
      >
        hello
      </div>
    </Dropdown> -->
  </div>
</div>

<!-- <div hidden={!showOptions}>
  <Filtering {searchStore} {languages_used} {category_names} />
</div> -->

<h2 class="flex items-end text-2xl -mb-1 {!showOptions ? 'hidden' : ''}">
  Books ({books_displayed.length})
</h2>

{#if entries.length <= 0}
  <p>No books added at the moment :(</p>
{:else if $searchStore.filtered.length <= 0}
  <p>No books found matching your search :(</p>
{/if}

<div class="dark:bg-slate-800 bg-white">
  {#each books_displayed as entry (entry.id)}
    <div>
      <ReadingListItem {entry} on:delete={openPopup} />
    </div>
  {/each}
</div>

<BookDeletePopUp
  {deletionBook}
  bind:openModal
  on:success={() => {
    openModal = false;
    invalidateAll();
  }}
/>
