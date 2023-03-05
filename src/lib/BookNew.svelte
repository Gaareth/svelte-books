<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import type { RequestHandler } from "../routes/$types";

  export let endpoint: string;

  let new_book = false;
  let name = "";
  let author = "";

  $: has_content = name.length > 0 && author.length > 0;

  async function newBook() {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ name, author }),
      headers: {
        "content-type": "application/json",
      },
    });

    const success = await response.json();
    if (success) {
      invalidateAll();
    } else {
        // TODO: error msg
    }
  }
</script>

<div class="border rounded p-2 my-2">
  <div class="flex justify-between pb-2">
    <h2 class="text-xl">Add new book</h2>
    <button on:click={() => (new_book = !new_book)}>
      {new_book ? "Cancel" : "Open"}
    </button>
  </div>
  {#if new_book}
    <div class="grid grid-cols-2 grid-rows-2">
      <label for="name">Name:</label>
      <input
        id="name"
        name="name"
        type="text"
        class="border"
        bind:value={name}
      />
      <label for="author">Author:</label>
      <input
        id="author"
        name="author"
        type="text"
        class="border"
        bind:value={author}
      />
    </div>

    {#if has_content}
      <button on:click={newBook}>Save new book</button>
    {/if}
  {/if}
</div>
