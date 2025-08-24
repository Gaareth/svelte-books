<script lang="ts">
  //@ts-ignore

  import BookListItem from "./BookListItem.svelte";

  import type { BookListItemType } from "$appTypes";

  export let books: BookListItemType[];
  export let on_delete: ((b: BookListItemType) => unknown) | undefined =
    undefined;
  export let allow_deletion = false;
</script>

<div class="grid grid-cols-2 lg:grid-cols-7 gap-2 mb-5 mt-3">
  {#each books as book, i (book.id)}
    <input type="hidden" name={`books[]`} value={book.id} />

    <BookListItem {book} {allow_deletion} {on_delete} />
    <!-- <BookListItem {book} bind:deletionBook bind:openModal/> -->
  {/each}
</div>

<!-- <BookDeletePopUp
  {deletionBook}
  bind:openModal
  on:success={() => {
    openModal = false;
    invalidateAll();
  }}
/> -->
