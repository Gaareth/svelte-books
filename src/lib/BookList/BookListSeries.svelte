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

{#each books as book, i (book.id)}
  <input type="hidden" name={`books[${i}]`} value={book.name} />

  <BookListItem {book}>
    <button
      class="group p-2 btn-delete focus:relative !border-0"
      title="Remove from series"
      type="button"
      slot="delete"
      hidden={!(!!on_delete && allow_deletion)}
      on:click={() => {
        !!on_delete && allow_deletion && on_delete(book);
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

