<script lang="ts">
  import { Moon } from "svelte-loading-spinners";

  import type { Book } from "@prisma/client";
  import { toast } from "svelte-french-toast";
  import { enhance } from "$app/forms";

  export let form;

  import { source } from "sveltekit-sse";
  import type { SSE_EVENT } from "../book/api/update_all/sse.js";
  const value = source("/book/api/update_all").onError((event: any) =>
    console.error({ event })
  );
  let seen = 0;
  let currentStatus: typeof SSE_EVENT | undefined = undefined;
  $: {
    try {
      console.log($value);

      currentStatus = JSON.parse($value);
    } catch (error) {
      currentStatus = undefined;
    }
    value;
  }

  let loading = false;
  let errorsBooks: Book[] = [];

  const reload_all = async () => {
    return;
    loading = true;
    const response = await fetch("/book/api/update_all", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });
    loading = false;

    const response_json = await response.json();
    const { success, booksUpdated } = response_json;
    errorsBooks = response_json.errorsBooks;

    if (success) {
      toast.success(`Successfully added ${booksUpdated} new entries`);
    } else if (booksUpdated == 0) {
      toast.error("Failed updating any book :(");
    } else {
      toast(
        `Updated ${booksUpdated} books and failed on ${errorsBooks.length}`,
        {
          icon: "⚠️",
        }
      );
    }
  };

  //TODO: toast
</script>

<h1>Settings</h1>

<div>
  <h2>Datasource</h2>
  {#if currentStatus !== undefined}
    {#if currentStatus.length !== undefined}
      <div>
        {currentStatus?.updates[currentStatus.updates.length-1]}
        <progress
          max={currentStatus?.length}
          value={currentStatus?.updates.length}
        />
      </div>
    {/if}
  {:else}
    <span>...</span>
  {/if}

  <form
    action="?/reload"
    method="POST"
    use:enhance={({ formElement, formData, action, cancel, submitter }) => {
      // `formElement` is this `<form>` element
      // `formData` is its `FormData` object that's about to be submitted
      // `action` is the URL to which the form is posted
      // calling `cancel()` will prevent the submission
      // `submitter` is the `HTMLElement` that caused the form to be submitted
      loading = true;
      return async ({ result, update }) => {
        update();
        loading = false;
        // `result` is an `ActionResult` object
        // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
      };
    }}
  >
    <button
      type="submit"
      class="btn-generic flex items-center gap-2"
      disabled={loading}
    >
      {#if loading}
        <span> <Moon size="18" color="black" duration="1s" /> </span>
        loading..
      {:else}
        Reload all
      {/if}
    </button>
  </form>
  <p>
    Updates all existing entries and tries to fetch new data for books without a
    connected datasource
  </p>
  {#if errorsBooks.length > 0}
    <div>
      {#each errorsBooks as book}
        <div>
          {book.name}
        </div>
      {/each}
    </div>
  {/if}
</div>
