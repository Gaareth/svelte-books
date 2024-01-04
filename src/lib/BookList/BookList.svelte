<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import { fade, scale } from "svelte/transition";
  import BookSearch from "../BookSearch.svelte";

  import type { BookFullType } from "$appTypes";
  import { createSearchStore, searchHandler } from "$lib/stores/search";
  import type { Book } from "@prisma/client";
  import { onDestroy } from "svelte";
  import { flip } from "svelte/animate";
  import type { ItemDeleteEvent } from "./BookListItem.svelte";
  import BookListItem from "./BookListItem.svelte";

  //@ts-ignore
  import MoreIcon from "svelte-icons/io/IoMdMore.svelte";

  import Filtering from "./Filtering.svelte";
  import { page } from "$app/stores";

  export let books: BookFullType[];

  const searchStore = createSearchStore(books);
  let added_book = false;

  let languages_used: string[];
  export let category_names: string[]; // not reactive

  $: {
    added_book = true;
    $searchStore.data = books;
    languages_used = books.reduce((result, b) => {
      let lang = b.bookApiData?.language;
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
  {#if books.length > 0}
    <div class="flex gap-2 justify-between">
      <BookSearch bind:search_term={$searchStore.search} />
      <button
        class="btn-generic-icon"
        on:click={() => (showOptions = !showOptions)}
      >
        <span class="w-5 block">
          <MoreIcon />
        </span>
      </button>
    </div>
  {/if}
</div>

<div hidden={!showOptions}>
  <Filtering
    {searchStore}
    {languages_used}
    {category_names}
  />
</div>

<h2 class="flex items-end text-2xl -mb-1 {!showOptions ? 'hidden' : ''}">
  Books ({books_displayed.length})
</h2>

{#if books.length <= 0}
  <p>No books added at the moment :(</p>
{:else if $searchStore.filtered.length <= 0}
  <p>No books found matching your search :(</p>
{/if}

{#each books_displayed as book (book.id)}
  <div>
    <BookListItem {book} on:delete={openPopup} />
  </div>
{/each}

<BookDeletePopUp
  {deletionBook}
  bind:openModal
  on:success={() => {
    openModal = false;
    invalidateAll();
  }}
/>
