<script lang="ts">
  import IoIosRemoveCircle from "svelte-icons/io/IoIosRemoveCircle.svelte";

  import type { BookRating } from "$appTypes";
  import BookListItem from "./BookListItem.svelte";

  export let books: BookRating[];
  export let on_delete: ((b: BookRating) => any) | undefined =
    undefined;
  export let allow_deletion: boolean = false;
</script>

{#each books as book, i (book.id)}
  <input type="hidden" name={`books[${i}]`} value={book.name} />

  <BookListItem {book}>
    <button
      class="group p-2 delete-button"
      title="Remove from series"
      type="button"
      slot="delete"
      hidden={!(!!on_delete && allow_deletion)}
      on:click={() => {
        !!on_delete && allow_deletion && on_delete(book)
      }}
    >
      <span
        class="block w-[20px] group-hover:animate-drop-hover group-active:animate-drop-click"
      >
        <IoIosRemoveCircle />
      </span>
    </button>
  </BookListItem>
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

<style lang="postcss">
  .delete-button {
    @apply  hover:bg-red-200 dark:text-red-200
            dark:bg-red-500 dark:border-red-500 
            dark:hover:bg-red-400 dark:hover:border-red-400
            bg-red-100 text-red-600
            
            focus:relative 
  }
</style>
