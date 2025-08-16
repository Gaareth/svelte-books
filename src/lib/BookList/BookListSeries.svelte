<script lang="ts">
  //@ts-ignore
  import IoIosRemoveCircle from "svelte-icons/io/IoIosRemoveCircle.svelte";

  import type { BookFullType, BookListItemType, BookRating } from "$appTypes";
  import BookListItem from "./BookListItem.svelte";

  export let books: BookListItemType[];
  export let on_delete: ((b: BookListItemType) => unknown) | undefined =
    undefined;
  export let allow_deletion = false;
</script>

<div class="grid grid-cols-2 lg:grid-cols-6 gap-2 my-5">
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
