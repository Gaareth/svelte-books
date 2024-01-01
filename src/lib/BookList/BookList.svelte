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
  import { sortBooksDefault } from "$lib/utils";
  import SortOrder from "./SortOrder.svelte";

  export let books: BookFullType[];

  const searchStore = createSearchStore(books);
  let added_book = false;

  $: {
    added_book = true;
    $searchStore.data = books;
  }

  $: books_displayed = $searchStore.filtered;

  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));
  onDestroy(() => {
    unsubscribe();
  });

  let deletionBook: Book;
  let openModal = false;

  let showOptions = false;
  let sortingReversed = false;

  type sortOption =
    | "date_created"
    | "date_read"
    | "author"
    | "title"
    | "ranking";

  let selectedSort: sortOption = "date_read";

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

  const sortBooks = () => {
    books_displayed = $searchStore.filtered.sort(
      (a, b) => cmpBooks(a, b) * (sortingReversed ? -1 : 1)
    );
  };

  const cmpBooks = (b1: BookFullType, b2: BookFullType) => {
    switch (selectedSort) {
      case "date_created":
        return b1.createdAt.getTime() - b2.createdAt.getTime();

      case "author":
        return b1.author.localeCompare(b2.author);

      case "title":
        return b1.name.localeCompare(b2.name);

      case "ranking":
        return (b1.rating?.stars ?? 0) - (b2.rating?.stars ?? 0);

      case "date_read":
      default:
        return sortBooksDefault(b1, b2);
    }
  };
</script>

<div class="flex justify-between mt-8 mb-2 sm:flex-row flex-col">
  <h2 class="flex items-end text-2xl -mb-1">Books</h2>
  {#if books.length > 0}
    <div class="flex gap-2">
      <BookSearch bind:search_term={$searchStore.search} />
      <button class="btn-generic" on:click={() => (showOptions = !showOptions)}>
        more
      </button>
    </div>
  {/if}
</div>
<!-- bind:value={selectedSort} on:change={() => $searchStore.filtered = $searchStore.filtered.sort(sortBooks)} -->
<!-- bind:value={$searchStore.sorting} -->
<div class="my-4" hidden={!showOptions}>
  <div class="flex gap-2">
    <select
      class="default-border border-red-600 border"
      bind:value={selectedSort}
      on:change={sortBooks}
    >
      <option value="date_read">Sort by date</option>
      <option value="date_created">Sort by date created</option>
      <option value="title">Sort by title</option>
      <option value="author">Sort by author</option>
      <option value="ranking">Sort by ranking</option>

    </select>
    <SortOrder bind:reversed={sortingReversed} on:click={sortBooks} />
  </div>
</div>

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
