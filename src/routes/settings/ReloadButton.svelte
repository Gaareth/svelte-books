<script lang="ts">
  import { onMount } from "svelte";

  import toast from "svelte-french-toast";

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  import RefreshIcon from "svelte-icons/io/IoMdRefresh.svelte";

  import type { SSE_EVENT } from "../book/api/update_all/sse";

  import { enhance } from "$app/forms";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";

  let loading = false;
  let evtSource: EventSource;
  export let currentStatus: SSE_EVENT | undefined;

  onMount(() => {
    evtSource = new EventSource("/book/api/update_all/");
    evtSource.onmessage = function (event) {
      // console.log(event.data);

      if (event.data === "undefined") {
        loading = false;
        return;
      }

      currentStatus = JSON.parse(decodeURIComponent(event.data));
      console.log(currentStatus);

      if (currentStatus!.id == "reload") {
        loading = currentStatus!.msg != "done";
      }
    };
  });
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

      return async ({ result, update }) => {
        update();
        loading = false;
        evtSource.close();

        // @ts-ignore
        const { success, booksUpdated } = result.data;

        if (success) {
          toast.success(`Successfully updated ${booksUpdated} entries`);
        } else if (booksUpdated == 0) {
          toast.error("Failed updating books :(");
        }

        // `result` is an `ActionResult` object
        // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
      };
    }}>
    <p>Updates api data for all existing entries</p>
    <button
      type="submit"
      class="btn-generic flex items-center justify-center gap-2 flex-none w-full sm:w-fit"
      disabled={loading}>
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
</div>
