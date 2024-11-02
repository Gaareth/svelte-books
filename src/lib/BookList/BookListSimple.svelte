<script lang="ts">
  import type { BookFull, BookRating } from "$appTypes";
  import BookListItem, {
    BookListItemType,
    type ItemDeleteEvent,
  } from "./BookListItem.svelte";

  export let books: BookListItemType[];
  export let on_delete:
    | ((e: CustomEvent<ItemDeleteEvent>) => unknown)
    | undefined = undefined;
  export let allow_deletion = false;
</script>

{#each books as book, i (book.id)}
  <input type="hidden" name={`books[${i}]`} value={book.name} />

  <BookListItem
    {book}
    on:delete={on_delete}
    allow_deletion={allow_deletion && !!on_delete}
  />
  <!-- <BookListItem {book} bind:deletionBook bind:openModal/> -->
{/each}

<!-- <BookDeletePopUp
  {deletionBook}
  bind:openModal
  on:success={() => {
    openModal = false;
    invalidateAll();
  }}
/> -->
