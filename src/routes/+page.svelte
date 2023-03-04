<script lang="ts">
  import { invalidate, invalidateAll } from "$app/navigation";
  import type { ActionData } from "./$types";

  export let data: any;

  let new_book = false;
  let name = "";
  let author = "";

  $: has_content = name.length > 0 && author.length > 0;

  async function newBook() {
    const response = await fetch("/", {
      method: "POST",
      body: JSON.stringify({name, author}),
      headers: {
        'content-type': 'application/json'
      }
    });
  
    const success = await response.json()
    console.log(success);
    if (success) {      
      invalidateAll();
    }
    
  }
</script>

<h1 class="text-center text-5xl my-4">LIST</h1>

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

{#each data.books as book}
  <div class="border-blue-400 border-2 my-3 p-1 flex gap-3">
    <a href="/book/{book.name}">{book.name}</a>
    <p>{book.author}</p>
  </div>
{/each}
