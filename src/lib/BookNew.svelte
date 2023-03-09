<script lang="ts">
  import { toast } from "svelte-french-toast";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";

  export let endpoint: string;
  export let listName: string;

  let new_book = false;
  let name = "";
  let author = "";

  $: has_content = name.length > 0 && author.length > 0;

  // const dispatch = createEventDispatcher();

  async function newBook() {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ name, author, listName }),
      headers: {
        "content-type": "application/json",
      },
    });

    const { success } = await response.json();

    if (success) {
      invalidateAll();
    } else {
      toast.error(
        "[" +
          response.status +
          "]" +
          " Error creating book: " +
          response.statusText
      );
    }
  }
</script>

{#if $page.data.session}
  <div class="border rounded-md p-3 my-2">
    <div class="flex justify-between">
      <h2 class="text-xl flex items-center justify-center">Add new book</h2>
      <button
        on:click={() => (new_book = !new_book)}
        class="rounded-lg border hover:bg-gray-50 px-5 py-2 text-sm font-medium"
      >
        {new_book ? "Cancel" : "Open"}
      </button>
    </div>
    {#if new_book}
      <div class="grid grid-cols-2 grid-rows-2 pt-2 items-center">
        <label for="name">Name:</label>
        <input
          id="name"
          name="name"
          type="text"
          class="input"
          bind:value={name}
        />
        <label for="author">Author:</label>
        <input
          id="author"
          name="author"
          type="text"
          class="input"
          bind:value={author}
        />
      </div>

      <div class="flex justify-end">
        <button
          on:click={newBook}
          class="btn-primary-black mt-5 mb-1"
          title="Add new book"
          disabled={!has_content}
        >
          Save new book
        </button>
      </div>
    {/if}
  </div>
{/if}
