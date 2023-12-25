<script lang="ts">
  import type {
    settingsApiReloadResult,
    settingsApiCreateResult,
  } from "./+page.server.js";

  // @ts-ignore
  import SuccessIcon from "svelte-icons/io/IoIosCheckmarkCircleOutline.svelte";
  // @ts-ignore
  import ErrorIcon from "svelte-icons/io/IoIosCloseCircleOutline.svelte";

  export let currentStatus: any;
  export let form: any;

  $: formDiffs = form as settingsApiReloadResult;
  $: formErrors = form as settingsApiCreateResult;
</script>


{#if form !== undefined && form !== null}
  <div class="default-border p-3 my-2">
    {#if Object.hasOwn(formDiffs, "diffs")}
      <p class="mb-2">Updated {formDiffs.booksUpdated} books</p>
      {#each formDiffs.diffs as diff}
        <div>
          <a class="hover:underline" href="/book/{diff.bookName}">{diff.bookName}</a> - 
          {diff.propName}: {diff.oldValue} --> {diff.newValue}
        </div>
      {:else}
        No changes found
      {/each}
    {:else if formErrors.errorsBooks !== undefined}
      {#if formErrors.errorsBooks.length > 0}
        <span class="inline-flex gap-1 mb-2">
          Finished updating all {formErrors.booksUpdated} entries.
          <span class="text-red-500 inline-flex items-center gap-1">
            <span class="w-[20px] inline-block">
              <ErrorIcon />
            </span>
            Failed in {formErrors.errorsBooks.length} entries
          </span>
        </span>

        <div>
          {#each formErrors.errorsBooks as errorBook}
            <div class="flex items-center gap-2">
              <span class="w-[20px] inline-block text-red-500">
                <ErrorIcon />
              </span>
              <a class="hover:underline" href="/book/{errorBook.book.name}">{errorBook.book.name}</a>
              -
              {#if errorBook.volumeId !== undefined}
                <a class="hover:underline" href="http://books.google.de/books?id={errorBook.volumeId}"
                  >volumeId: {errorBook.volumeId}</a
                >
              {/if}
              -
              <span class="text-red-500 font-bold">
                Error: {errorBook.error}
              </span>
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
          updated all {formErrors.booksUpdated}
          entries
        </span>
      {/if}
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
