<script lang="ts">
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import type { ActionData } from "../$types.js";

  import type { Book } from "@prisma/client";
  import { toast } from "svelte-french-toast";
  import { enhance } from "$app/forms";
  import ReloadButton from "./ReloadButton.svelte";

  // @ts-ignore
  import SuccessIcon from "svelte-icons/io/IoIosCheckmarkCircleOutline.svelte";
  // @ts-ignore
  import ErrorIcon from "svelte-icons/io/IoIosCloseCircleOutline.svelte";


  import type { SSE_EVENT } from "../book/api/update_all/sse.js";
  import type {
    settingsApiReloadResult,
    settingsApiCreateResult,
  } from "./+page.server.js";
  import AddApiButton from "./AddApiButton.svelte";
  import ApiResult from "./ApiResult.svelte";

  export let form;
  let formDiffs = form as settingsApiReloadResult;
  let formErrors = form as settingsApiCreateResult;

  console.log("form: ", form);

  let evtSource: EventSource;

  let currentStatus: typeof SSE_EVENT | undefined = undefined;

  let loading = false;

  //TODO: toast
</script>

<h1 class="text-5xl my-4">Settings</h1>

<section>
  <h2 class="text-2xl">Datasource</h2>
  <div class="flex flex-col gap-6 sm:gap-2">
    <ReloadButton bind:currentStatus>
      {#each formDiffs.diffs as diff}
        <div>
          {diff.bookName} - {diff.propName}: {diff.oldValue} --> {diff.newValue}
        </div>
      {:else}
        No changes found
      {/each}
    </ReloadButton>
    <AddApiButton bind:currentStatus>
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
          updated all {formErrors.booksUpdated}
          entries
        </span>
      {/if}
    </AddApiButton>
    <ApiResult {form} {currentStatus} />
  </div>
</section>
