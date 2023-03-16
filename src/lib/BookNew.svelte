<script lang="ts">
  import { toast } from "svelte-french-toast";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { Moon } from "svelte-loading-spinners";
  import { darkMode } from "../stores";

  export let endpoint: string;
  export let listName: string;

  let new_book = false;
  let name = "";
  let author = "";
  let loading: boolean = false;

  $: has_content = name.length > 0 && author.length > 0;

  // const dispatch = createEventDispatcher();

  async function newBook() {
    loading = true;
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ name, author, listName }),
      headers: {
        "content-type": "application/json",
      },
    });

    const { success, message } = await response.json();
    loading = false;

    if (success) {
      invalidateAll();
    } else {
      if (message) {
        toast.error(message);
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
  }
</script>

{#if $page.data.session}
  <div
    class="border rounded-md p-3 my-2 dark:bg-slate-700 dark:border-slate-600"
  >
    <div class="flex justify-between">
      <h2 class="text-xl flex items-center justify-center">Add new book</h2>
      <button
        on:click={() => (new_book = !new_book)}
        class="rounded-lg border hover:bg-gray-50 px-5 py-2 text-sm font-medium
        dark:bg-slate-600 dark:border-0 dark:hover:bg-slate-500"
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
          class="input dark:bg-slate-600 dark:border-slate-500"
          bind:value={name}
        />
        <label for="author">Author:</label>
        <input
          id="author"
          name="author"
          type="text"
          class="input dark:bg-slate-600 dark:border-slate-500"
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
          {#if loading}
            <Moon
              size="25"
              color={$darkMode ? "white" : "black"}
              duration="1s"
            />
          {/if}
          Save new book
        </button>
      </div>
    {/if}
  </div>
{/if}
