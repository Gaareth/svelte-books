<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import { fade, scale } from "svelte/transition";
  import BookSearch from "../BookSearch.svelte";

  import { createSearchStore, searchHandler } from "$lib/stores/search";
  import type { Book } from "@prisma/client";
  import { onDestroy } from "svelte";
  import { flip } from "svelte/animate";
  import type { BookFullType } from "$appTypes";
  import BookListItem from "./BookListItem.svelte";
  import type { ItemDeleteEvent } from "./BookListItem.svelte";

  export let books: BookFullType[];

  const searchStore = createSearchStore(books);
  let added_book = false;

  $: {
    added_book = true;
    $searchStore.data = books;
  }

  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));
  onDestroy(() => {
    unsubscribe();
  });

  let deletionBook: Book;
  let openModal: boolean = false;

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
  <h2 class="flex items-end text-2xl -mb-1">Books</h2>
  {#if books.length > 0}
    <BookSearch bind:search_term={$searchStore.search} />
  {/if}
</div>

{#if books.length <= 0}
  <p>No books added at the moment :(</p>
{:else if $searchStore.filtered.length <= 0}
  <p>No books found matching your search :(</p>
{/if}

{#each $searchStore.filtered as book (book.id)}
  <div transition:animate|local={{}} animate:flip={{ duration: 300 }}>
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
