<script lang="ts">
  import type { settingsApiResult } from "./+page.server.js";
  import { enhance } from "$app/forms";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import toast from "svelte-french-toast";

  // @ts-ignore
  import SuccessIcon from "svelte-icons/io/IoIosCheckmarkCircleOutline.svelte";
  // @ts-ignore
  import ErrorIcon from "svelte-icons/io/IoIosCloseCircleOutline.svelte";
  // @ts-ignore
  import AddIcon from "svelte-icons/io/IoMdAdd.svelte";

  let loading = false;
  let evtSource: EventSource;
  let currentStatus: any;

  export let form: settingsApiResult;
</script>

<form
  class="flex flex-col sm:flex-row justify-between gap-2 items-start"
  action="?/try_add"
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
      // console.log(event);
      // console.log(decodeURIComponent(event.data));

      currentStatus = JSON.parse(decodeURIComponent(event.data));
    };
    return async ({ result, update }) => {
      update();
      loading = false;
      evtSource.close();
      const { success, booksUpdated, errorsBooks } = result.data;
      console.log(result.data);

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
  <p>Tries to connect all books with a matching google books api entry</p>
  <button
    type="submit"
    class="btn-generic flex items-center justify-center gap-2 flex-none w-full sm:w-fit"
    disabled={loading}
  >
    {#if loading}
      <LoadingSpinner />
      loading..
    {:else}
      <span class="w-[20px]"><AddIcon /></span>
      Add API connections
    {/if}
  </button>
</form>

{#if form !== undefined && form !== null && form.errorsBooks !== undefined}
  <div class="default-border p-3 my-2">
    {#if form.errorsBooks.length > 0}
      <span class="inline-flex gap-1 mb-2">
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
              <a href="http://books.google.de/books?id={errorBook.volumeId}"
                >volumeId: {errorBook.volumeId}</a
              >
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
  </div>
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
