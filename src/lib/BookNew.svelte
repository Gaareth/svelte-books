<script lang="ts">
  import BookApiDetails from "./BookApiSelection/BookApiDetails.svelte";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { toast } from "svelte-french-toast";
  import { Moon } from "svelte-loading-spinners";

  //@ts-ignore
  import ArrowDown from "svelte-icons/io/IoMdArrowDropdown.svelte";
  //@ts-ignore
  import ArrowUp from "svelte-icons/io/IoMdArrowDropup.svelte";

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import AutoComplete from "simple-svelte-autocomplete";
  import BookApi from "./BookApiSelection/BookApi.svelte";
  import type { queriedBookFull } from "$appTypes";

  export let endpoint = "/book/create";
  export let listName: string;
  export let authors: string[];
  $: authors = [...new Set(authors)];

  let new_book = false;
  let name = "";
  let author = "";
  let loading = false;

  let api_query = "";
  let api_open = false;

  $: has_content = name.length > 0 && author.length > 0;
  let volumeId: string;
  // const dispatch = createEventDispatcher();

  async function newBook() {
    loading = true;

    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ name, author, listName, volumeId }),
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

  let getBookPromise: Promise<queriedBookFull> | undefined = undefined;
  async function take_over() {
    if (volumeId !== undefined) {
      let data = await getBookPromise;
      console.log(data);
      name = data?.volumeInfo.title || "";


      author = data?.volumeInfo.authors[0] || "";
    } else {
      api_open = true;
      api_query = name + " " + author;
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
        dark:bg-slate-600 dark:border-slate-600 dark:hover:bg-slate-500 dark:hover:border-slate-500"
      >
        {new_book ? "Cancel" : "Open"}
      </button>
    </div>
    {#if new_book}
      <div class="grid grid-cols-2 grid-rows-2 pt-2 items-center gap-1">
        <label for="name">Name:</label>
        <input
          id="name"
          name="name"
          type="text"
          class="input dark:bg-slate-600 dark:border-slate-500"
          bind:value={name}
        />
        <label for="author">Author:</label>
        <!-- <input
          id="author"
          name="author"
          type="text"
          class="input dark:bg-slate-600 dark:border-slate-500"
          bind:value={author}
        /> -->
        <AutoComplete
          items={authors}
          bind:text={author}
          create={true}
          id="author"
          name="author"
          class="input dark:bg-slate-600 dark:border-slate-500"
        />
      </div>

      <div class="flex justify-center mt-4">
        <button
          on:click={take_over}
          class="my-2 flex btn-generic items-center group
        disabled:hover:cursor-not-allowed"
          disabled={!(name.length > 0 && author.length > 0) &&
            volumeId === undefined}
        >
          take over data
          <span class="group-disabled:w-0 w-8 self-center block">
            {#if volumeId !== undefined}
              <ArrowUp />
            {:else if name.length > 0 && author.length > 0}
              <ArrowDown />
            {/if}
          </span>
        </button>
      </div>

      <div>
        <BookApiDetails
          bind:getBookPromise
          bind:volumeId
          bind:query={api_query}
          bind:open={api_open}
        />
      </div>

      <div class="flex justify-end">
        <button
          on:click={newBook}
          class="btn-primary-black mt-5 mb-1 transition-all"
          title="Add new book"
          disabled={!has_content}
        >
          {#if loading}
            <div>
              <Moon size="20" color="white" duration="1s" />
            </div>
          {/if}
          Save new book
        </button>
      </div>
    {/if}
  </div>
{/if}
