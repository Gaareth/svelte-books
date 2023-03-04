<script lang="ts">
  import type { Book } from "@prisma/client";

  export let data: any;
  let book: Book = data.book;

  let edit = false;
</script>

<div class="py-3">
  <form class="flex justify-between" method="POST">
    {#if !edit}
      <div>
        <h1 class="text-4xl">{book.name}</h1>
        <div>
          <p class="text-gray-600">Author: {book.author}</p>
          <p class="text-gray-600">Read (month): {book.month_read}</p>
        </div>

      </div>
    {:else}
      <div class="flex flex-col">
        <div>
          <label for="name">Name:</label>
          <input
            id="name"
            name="name"
            type="text"
            class="border"
            bind:value={book.name}
          />
        </div>
        <div>
          <label for="author">Author:</label>
          <input
            id="author"
            name="author"
            type="text"
            class="border"
            bind:value={book.author}
          />
        </div>
      </div>
    {/if}

    <div class="flex flex-col gap-1">
      <input type="hidden" name="id" value={book.id} />
      <button
        type="button"
        class="border hover:border-blue-500"
        on:click={() => {
          edit = !edit;
        }}>edit</button
      >
      <button formaction="?/delete" class="border hover:border-red-500"
        >delete</button
      >
      {#if edit}
        <button formaction="?/save"> Save </button>
      {/if}
    </div>
  </form>
</div>
