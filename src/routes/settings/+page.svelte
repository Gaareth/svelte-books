<script lang="ts">
	import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import type { ActionData } from "../$types.js";

  import type { Book } from "@prisma/client";
  import { toast } from "svelte-french-toast";
  import { enhance } from "$app/forms";

  // @ts-ignore
  import SuccessIcon from "svelte-icons/io/IoIosCheckmarkCircleOutline.svelte";
  // @ts-ignore
  import ErrorIcon from "svelte-icons/io/IoIosCloseCircleOutline.svelte";

  export let form: settingsApiResult;

  import type { SSE_EVENT } from "../book/api/update_all/sse.js";
  import type { settingsApiResult } from "./+page.server.js";

  let evtSource: EventSource;

  let currentStatus: typeof SSE_EVENT | undefined = undefined;

  let loading = false;

  //TODO: toast
</script>

<h1>Settings</h1>

<div>
  <h2>Datasource</h2>

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
      evtSource = new EventSource("/book/api/update_all/");
      evtSource.onmessage = function (event) {
        console.log(event);
        currentStatus = JSON.parse(event.data);
      };
      return async ({ result, update }) => {
        update();
        loading = false;
        evtSource.close();
        const { success, booksUpdated, errorsBooks } = result.data;

        if (success) {
          toast.success(`Successfully added ${booksUpdated} new entries`);
        } else if (booksUpdated == 0) {
          toast.error("Failed updating any book :(");
        } else {
          toast(
            `Updated ${booksUpdated} books and failed in ${errorsBooks.length}`,
            {
              icon: "⚠️",
            }
          );
        }

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
        <LoadingSpinner />
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
  {#if form !== undefined && form !== null}
    {#if form.errorsBooks.length > 0}
      <span class="inline-flex gap-1">
        Finished updating all {form.booksUpdated} entries.
        <span class="text-red-500 inline-flex items-center gap-1">
          <span class="w-[20px] inline-block">
            <ErrorIcon />
          </span>
          Failed in {form.errorsBooks.length} entries
        </span>
      </span>
      <div>
        {#each form.errorsBooks as errorBook}
          <div class="flex items-center gap-2">
            <span class="w-[20px] inline-block text-red-500">
              <ErrorIcon />
            </span>
            <a href="/book/{errorBook.book.name}">{errorBook.book.name}</a>
            -
            {#if errorBook.volumeId !== undefined}
              <a href="http://books.google.de/books?id={errorBook.volumeId}">volumeId: {errorBook.volumeId}</a>
            {/if}
            - Error: {errorBook.error}
          </div>
        {/each}
      </div>
    {:else}
      <span class="inline-flex gap-1 flex-wrap">
        <span class="text-green-400 inline-flex items-center gap-1">
          <span class="w-[22px] inline-block">
            <SuccessIcon />
          </span>Successfully
        </span>
        updated all {form.booksUpdated}
        entries
      </span>
    {/if}
  {/if}

  {#if currentStatus !== undefined && !form && currentStatus.msg != "done"}
    <div class="flex flex-col">
      <div>
        <span>{currentStatus.msg}</span>
        <span>{currentStatus.items}/{currentStatus.max}</span>
      </div>
      <progress max={currentStatus.max} value={currentStatus.items} />
    </div>
  {/if}
</div>
