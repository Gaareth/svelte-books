<script lang="ts">
  import type { settingsApiReloadResult } from "./+page.server.js";
  import { enhance } from "$app/forms";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import toast from "svelte-french-toast";

  // @ts-ignore
  import SuccessIcon from "svelte-icons/io/IoIosCheckmarkCircleOutline.svelte";
  // @ts-ignore
  import ErrorIcon from "svelte-icons/io/IoIosCloseCircleOutline.svelte";
  // @ts-ignore
  import RefreshIcon from "svelte-icons/io/IoMdRefresh.svelte";

  let loading = false;
  let evtSource: EventSource;
  let currentStatus: any;

  export let form: settingsApiReloadResult;
</script>

<div>
  <form
    action="?/reload"
    method="POST"
    class="flex flex-col sm:flex-row justify-between gap-2 items-start"
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
        const { success, booksUpdated } = result.data;

        if (success) {
          toast.success(`Successfully updated ${booksUpdated} entries`);
        } else if (booksUpdated == 0) {
          toast.error("Failed updating books :(");
        }

        // `result` is an `ActionResult` object
        // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
      };
    }}
  >
    <p>Updates api data for all existing entries</p>
    <button
      type="submit"
      class="btn-generic flex items-center justify-center gap-2 flex-none w-full sm:w-fit"
      disabled={loading}
    >
      {#if loading}
        <LoadingSpinner />
        loading..
      {:else}
        <span class="w-[20px]">
          <RefreshIcon />
        </span>
        Reload all
      {/if}
    </button>
  </form>

  {#if form !== undefined && form !== null}
    {#each form.diffs as diff}
      <div>
        {diff.bookName} - {diff.propName}: {diff.oldValue} --> {diff.newValue}
      </div>
    {:else}
      No changes found
    {/each}
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
