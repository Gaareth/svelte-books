<script lang="ts">
    import BookListItem from "./BookListItem.svelte";

    import type { BookWithApiData } from "$src/app";
    import type { Book } from "$src/generated/prisma/browser";

    interface Props {
        books: BookWithApiData[];
        on_delete?: ((b: Book) => unknown) | undefined;
        allow_deletion?: boolean;
    }

    let {
        books,
        on_delete = undefined,
        allow_deletion = false,
    }: Props = $props();
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
