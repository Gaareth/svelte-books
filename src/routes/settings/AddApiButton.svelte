<script lang="ts">
  import { enhance } from "$app/forms";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import { onMount } from "svelte";
  import toast from "svelte-french-toast";

  // @ts-ignore
  import AddIcon from "svelte-icons/io/IoMdAdd.svelte";

  let loading = false;
  let evtSource: EventSource;
  onMount(() => {
    evtSource = new EventSource("/book/api/update_all/");
    evtSource.onmessage = function (event) {
      if (event.data === "undefined") {
        loading = false;
        return;
      }
      // console.log(event);
      // console.log(decodeURIComponent(event.data));

      currentStatus = JSON.parse(decodeURIComponent(event.data));
      // console.log(currentStatus);

      loading = currentStatus.msg != "done";

      // if (currentStatus.msg == "done") {
      //   evtSource.close();
      // }
    };
  });

  export let currentStatus: any;
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

    return async ({ result, update }) => {
      update();
      loading = false;
      evtSource.close();

      // console.log(result);
      if (result === undefined) {
        return;
      }

      // @ts-ignore
      const { success, updatedBookNames, errorsBooks } = result.data;
      //console.log(result.data);

      if (success) {
        toast.success(
          `Successfully added ${updatedBookNames.length} new entries`
        );
      } else if (updatedBookNames.length == 0) {
        toast.error("Failed updating any book :(");
      } else {
        toast(
          `Updated ${updatedBookNames.length} books and failed in ${errorsBooks.length}`,
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
  <div>
    <label class="flex items-center gap-2">
      Connect all:
      <input type="checkbox" name="connect-all" class="" />
    </label>
    <p>Tries to connect all books with a matching google books api entry</p>
  </div>
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
