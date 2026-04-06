<script lang="ts">
  import clsx from "clsx";
  import toast from "svelte-french-toast";

  import { MAX_RATING } from "$lib/constants/constants";

  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { type BookWithOwnership, type ReviewListItemType } from "$appTypes";
  import ClearButton from "$components/input/ClearButton.svelte";
  import DateSelector, {
    DEFAULT_OPTIONAL_DATETIME,
  } from "$components/input/DateSelector.svelte";
  import EventDone from "$lib/icons/EventDone.svelte";
  import EventProgress from "$lib/icons/EventProgress.svelte";
  import InputAny from "$components/input/InputAny.svelte";
  import InputSelect from "$components/input/InputSelect.svelte";
  import LineChartDrawer from "$components/input/LineChartDrawer.svelte";
  import Modal from "$components/Modal.svelte";
  import Rating from "$lib/components/Rating.svelte";
  import {
    READING_ACTIVITY_TYPES,
    READING_STATUS_VALUES,
  } from "$lib/constants/enums";
  import OwnershipForm from "../OwnershipForm.svelte";
  import {
    shouldShowRating,
    shouldShowFinishedDate,
    shouldShowStartedDate,
  } from "./utils";
  import InputNumber from "../../input/InputNumber.svelte";

  export let book: BookWithOwnership;
  export let bookId: string | undefined = undefined;
  export let showModal = false;
  export let entry: ReviewListItemType | undefined = undefined;
  $: createNew = entry === undefined;

  let stars = entry?.rating?.stars;
  let readingStatus = entry?.status.status;

  let prevShowModal = false;

  $: {
    if (showModal && !prevShowModal) {
      readingStatus = entry?.status.status;
    }

    prevShowModal = showModal;
  }

  $: showRating = shouldShowRating(readingStatus);
  $: showFinishedDate = shouldShowFinishedDate(readingStatus);
  $: showStartedDate = shouldShowStartedDate(readingStatus);

  let tensionGraph =
    entry?.storyGraphs && entry?.storyGraphs?.length > 0
      ? {
          labels: JSON.parse(entry.storyGraphs[0].labels),
          details: JSON.parse(entry.storyGraphs[0].details),
          data: JSON.parse(entry.storyGraphs[0].data),
          title: entry.storyGraphs[0].title,
        }
      : {
          title: "tension", // the rest is default in the component
        };

  let error: Record<string, any> | undefined = undefined;

  // Create separate copies to prevent DateSelector components from sharing the same object reference
  $: dateStartedValue = entry?.dateStarted
    ? { ...entry.dateStarted }
    : { ...DEFAULT_OPTIONAL_DATETIME };
  $: dateFinishedValue = entry?.dateFinished
    ? { ...entry.dateFinished }
    : { ...DEFAULT_OPTIONAL_DATETIME };

  $: bookOwnership = book.ownership?.status;
  $: location = book.ownership?.location;
</script>

<Modal bind:showModal divClassName="w-full" className="w-full lg:w-2/5">
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
    class="flex flex-col h-full justify-center"
    use:enhance={() => {
      return async ({ update, result }) => {
        // console.log("result", result);

        await invalidateAll();

        //@ts-ignore
        if (result.success) {
          toast.success(
            `Successfully ${createNew ? "created" : "updated"} reading activity`
          );
          showModal = false;
          error = undefined;
        } else {
          //@ts-ignore
          console.log("error", result.error);
          //@ts-ignore
          error = result.error;

          toast.error(
            `Error ${createNew ? "creating" : "updating"} reading activity`
          );
        }
      };
    }}>
    {#if entry !== undefined}
      <input type="hidden" name="id" value={entry.id} />
    {:else}
      <input type="hidden" name="bookId" value={bookId} />
    {/if}

    <div class="mt-5 flex flex-col gap-2 sm:gap-4">
      {#if true}
        <div>
          <InputSelect
            bind:value={readingStatus}
            displayName="Status:"
            name={"status"}
            selectClassName="dark:bg-slate-600"
            clearButton={false}
            error={error?.status}>
            {#each READING_STATUS_VALUES as status}
              <option value={status}>
                {status}
              </option>
            {/each}
          </InputSelect>
        </div>
      {/if}

      <!-- <div class="flex justify-center sm:mt-5">
        <ToggleGroup
          options={READING_STATUS_VALUES}
          groupClass="mb-2 inline-flex"
          btnClass="px-2 py-2 sm:py-0 hover:bg-gray-50 dark:hover:bg-slate-500 border border-s-0 dark:border-slate-500 dark:bg-slate-600"
          btnSelectedClass="dark:bg-slate-500 bg-gray-100"
          startClass="border-s rounded-s-md"
          endClass="rounded-e-md"
        />
      </div> -->

      {#if showStartedDate}
        <div>
          <InputAny name="dateStarted" error={error?.dateStarted}>
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
              datetime={dateStartedValue}
              clearButton={true} />
          </InputAny>
        </div>
      {/if}

      {#if showFinishedDate}
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
              datetime={dateFinishedValue}
              clearButton={true} />
          </InputAny>
        </div>
      {/if}

      {#if showRating}
        <div class="my-2">
          <h2 class="text-xl">
            <label for="stars">Rating</label>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            <div>
              <InputNumber
                inputClass="py-0.5 text-center btn-generic-color-2"
                name="stars"
                type="number"
                step="0.5"
                bind:value={stars}
                min="0"
                max={MAX_RATING}
                skipLabel={true}
                clearButton={true} />
            </div>

            <div class="flex sm:justify-center">
              <Rating
                bind:rating={stars}
                rating_max={MAX_RATING}
                editable={true} />
            </div>
          </div>
        </div>

        <section>
          <details>
            <summary
              class={clsx(
                "cursor-pointer text-xl",
                !entry?.rating?.comment && "text-secondary"
              )}>
              Comment
            </summary>
            <textarea
              class="w-full input dark:bg-slate-600"
              name="comment"
              id="comment"
              value={entry?.rating?.comment ?? ""}
              rows="5" />
          </details>
        </section>

        <section>
          <details>
            <summary
              class={clsx(
                "cursor-pointer text-xl",
                entry?.storyGraphs?.length == 0 && "text-secondary"
              )}>
              Story graphs
            </summary>
            <div class="default-border p-2 dark:bg-slate-600">
              <LineChartDrawer
                allowEdits={true}
                bgColorDark="#64748b"
                inputClassName="dark:bg-slate-500 dark:border-slate-500"
                bind:title={tensionGraph.title}
                bind:labels={tensionGraph.labels}
                bind:details={tensionGraph.details}
                bind:data={tensionGraph.data} />
              <input
                type="hidden"
                name="graphs[title]"
                value={tensionGraph.title} />
              <input
                type="hidden"
                name="graphs[labels]"
                value={JSON.stringify(tensionGraph.labels)} />
              <input
                type="hidden"
                name="graphs[details]"
                value={JSON.stringify(tensionGraph.details)} />
              <input
                type="hidden"
                name="graphs[data]"
                value={JSON.stringify(tensionGraph.data)} />
            </div>
          </details>
        </section>
      {/if}

      {#if readingStatus == READING_ACTIVITY_TYPES.ACQUIRED}
        <OwnershipForm
          className="flex flex-col items-center"
          {bookOwnership}
          {location}
          {error}
          acquiredAtDate={dateStartedValue} />
      {/if}
    </div>

    <div
      class="min-[500px]:flex min-[500px]:justify-end grid grid-cols-2 gap-2 mt-auto">
      <button
        class="dark:text-white py-3 px-4 my-4 rounded-md w-full dark:bg-slate-600 dark:hover:bg-gray-500 btn-generic dark:border-none"
        type="button"
        on:click={() => (showModal = false)}>
        Cancel
      </button>
      <button
        class="bg-blue-700 text-white py-3 px-4 my-4 rounded-md w-full dark:hover:bg-blue-600 hover:bg-blue-800"
        type="submit">
        {entry != null ? "Update" : "Create"}
      </button>
    </div>
  </form>
</Modal>
