<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { READING_STATUS_VALUES } from "$appTypes";
  import DateSelector, {
    DEFAULT_OPTIONAL_DATETIME,
  } from "$lib/DateSelector.svelte";
  import EventDone from "$lib/icons/EventDone.svelte";
  import EventProgress from "$lib/icons/EventProgress.svelte";
  import InputAny from "$lib/InputAny.svelte";
  import InputSelect from "$lib/InputSelect.svelte";
  import Modal from "$lib/Modal.svelte";
  import Rating from "$lib/Rating.svelte";
  import toast from "svelte-french-toast";
  import { MAX_RATING } from "../../constants";
  import { type ReviewListItemType } from "$appTypes";

  export let bookId: string | undefined = undefined;
  export let showModal = false;
  export let entry: ReviewListItemType | undefined = undefined;
  let stars = entry?.rating?.stars;
</script>

<Modal
  bind:showModal
  divClassName="w-full h-full flex flex-col"
  className="w-[95%] lg:w-2/5 h-4/5 lg:h-4/6"
>
  <div class="flex items-center gap-4 w-full" slot="header">
    <p class="font-medium">
      {entry != null ? "Edit" : "Create"} Reading Activity
    </p>
  </div>

  <form
    action={entry != null
      ? "/api/reading-activity/update"
      : "/api/reading-activity/create"}
    method="POST"
    class="flex flex-col h-full"
    use:enhance={() => {
      return async ({ update, result }) => {
        console.log("result", result);

        //@ts-ignore
        if (result.success) {
          toast.success(
            `Successfully ${
              entry == null ? "created" : "updated"
            } reading activity`
          );
          showModal = false;
        } else {
          //@ts-ignore
          console.log("error", result.error);

          toast.error(
            `Error ${entry == null ? "creating" : "updating"} reading activity`
          );
        }

        invalidateAll();
      };
    }}
  >
    {#if entry !== undefined}
      <input type="hidden" name="id" value={entry.id} />
    {:else}
      <input type="hidden" name="bookId" value={bookId} />
    {/if}

    <div class="mt-5 flex flex-col gap-4">
      <div>
        <InputAny name="dateStarted">
          <div class="icon-wrapper" slot="label">
            <span class="w-5 block" title="date started">
              <EventProgress />
            </span>
            Date started:
          </div>

          <DateSelector
            slot="input"
            id="dateStarted"
            name="dateStarted"
            inputClassName="!w-full !input dark:bg-slate-600"
            className="w-full"
            datetime={entry?.dateStarted ?? DEFAULT_OPTIONAL_DATETIME}
          />
        </InputAny>
      </div>

      <div>
        <InputAny name="dateFinished">
          <div class="icon-wrapper" slot="label">
            <span class="w-5 block" title="date read">
              <EventDone />
            </span>
            Date read:
          </div>

          <DateSelector
            id="dateFinished"
            name="dateFinished"
            inputClassName="!w-full !input dark:bg-slate-600"
            className="w-full"
            slot="input"
            datetime={entry?.dateFinished ?? DEFAULT_OPTIONAL_DATETIME}
          />
        </InputAny>
      </div>

      <div>
        <InputSelect
          value={entry?.status}
          displayName="Status"
          name={"status"}
          selectClassName="dark:bg-slate-600"
        >
          {#each READING_STATUS_VALUES as status}
            <option value={status}>
              {status}
            </option>
          {/each}
        </InputSelect>
      </div>

      <div class="flex gap-2 items-center my-1">
        <h2 class="text-xl">Rating</h2>
        <div>
          (<input
            class="max-w-[3.5rem] p-0 text-center input dark:bg-slate-600"
            name="stars"
            type="number"
            step="0.5"
            bind:value={stars}
            min="0"
            max={MAX_RATING}
          />
          / {MAX_RATING})
        </div>

        <div class="flex-1 flex justify-center">
          <Rating bind:rating={stars} rating_max={MAX_RATING} editable={true} />
        </div>
      </div>

      <section>
        <h2 class="text-xl">Comment</h2>
        <div class="w-full">
          <textarea
            class="w-full input dark:bg-slate-600"
            name="comment"
            id="comment"
            value={entry?.rating?.comment ?? ""}
            rows="5"
          />
        </div>
      </section>
    </div>

    <div
      class="min-[500px]:flex min-[500px]:justify-end grid grid-cols-2 gap-2 mt-auto"
    >
      <button
        class="dark:text-white py-3 px-4 my-4 rounded-md w-full dark:bg-slate-600 dark:hover:bg-gray-500 btn-generic dark:border-none"
        type="button"
        on:click={() => (showModal = false)}
      >
        Cancel
      </button>
      <button
        class="bg-blue-700 text-white py-3 px-4 my-4 rounded-md w-full dark:hover:bg-blue-600 hover:bg-blue-800"
        type="submit"
      >
        {entry != null ? "Update" : "Create"}
      </button>
    </div>
  </form>
</Modal>
