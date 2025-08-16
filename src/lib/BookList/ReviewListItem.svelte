<script context="module" lang="ts">
  export type ItemDeleteEvent = { book: Book };
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import {
    READING_STATUS,
    READING_STATUS_VALUES,
    type BookRating,
    type ReadingListItemType,
    type ReviewListItemType,
  } from "$appTypes";
  import { createEventDispatcher } from "svelte";
  //@ts-ignore
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
  //@ts-ignore
  import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
  //@ts-ignore
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";
  import { MAX_RATING } from "../../constants";
  import Pages from "$lib/icons/pages.svelte";
  import { Prisma, type Book } from "@prisma/client";

  import clsx from "clsx";
  import DateSelector, {
    DEFAULT_OPTIONAL_DATETIME,
    formatOptionalDate,
    formatShort,
    type OptionalDate,
  } from "$lib/DateSelector.svelte";
  import { date } from "zod";
  import EventDone from "$lib/icons/EventDone.svelte";
  import EventProgress from "$lib/icons/EventProgress.svelte";
  import CalenderAdd from "$lib/icons/CalenderAdd.svelte";
  import ReadingList from "./ReadingList.svelte";
  import { dateDiffFormatted, optionalToDate, slideHeight } from "$lib/utils";
  import LineChartDrawer from "$lib/LineChartDrawer.svelte";
  import Modal from "$lib/Modal.svelte";
  import OpenNew from "$lib/icons/OpenNew.svelte";
  import InputAny from "$lib/InputAny.svelte";
  import InputSelect from "$lib/InputSelect.svelte";
  import { en } from "zod/v4/locales";
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import ReadingActivityDeletePopUp from "$lib/ReadingActivityDeletePopUp.svelte";
  import { invalidate, invalidateAll } from "$app/navigation";
  import Rating from "$lib/Rating.svelte";
  import InfoIcon from "$lib/icons/InfoIcon.svelte";
  import Dropdown from "$lib/Dropdown.svelte";
  import DropdownIcon from "$lib/icons/DropdownIcon.svelte";
  import { applyAction, enhance } from "$app/forms";
  import toast from "svelte-french-toast";
  import ReadingActivityForm from "./ReadingActivityForm.svelte";

  export let entry: ReviewListItemType;

  // export let deletionBook: Book | undefined = undefined;
  // export let openModal: boolean = false;
  export let allow_deletion: boolean | undefined = true;

  const dispatch = createEventDispatcher<{ delete: ItemDeleteEvent }>();
  console.log(entry.storyGraphs);

  let expanded = false;
  let editExpanded = false;
  let deleteExpanded = false;

  const getColor = (statuss: string) => {
    const status = statuss as READING_STATUS;

    switch (status) {
      case "reading":
        return "bg-yellow-500";
      case "did not finish":
        return "bg-red-600";
      case "finished":
        return "bg-green-500";
      case "paused":
        return "bg-gray-500";
      case "to read":
        return "bg-blue-500";
      default: {
        // This will cause a compile-time error if a case is missing
        // by ensuring 'never' type is handled
        const exhaustiveCheck: never = status;
        throw new Error(`Unhandled status: ${status}`);
      }
    }
  };

  let tensionGraph =
    entry.storyGraphs.length > 0
      ? {
          labels: JSON.parse(entry.storyGraphs[0].labels),
          details: JSON.parse(entry.storyGraphs[0].details),
          data: JSON.parse(entry.storyGraphs[0].data),
          title: entry.storyGraphs[0].title,
        }
      : {
          title: "tension", // the rest is default in the component
        };

  let stars = entry.rating?.stars ?? 0;
</script>

<div
  class="item-border mb-3 p-2 items-center
     w-full gap-2 flex"
>
  <div
    class="min-h-10 min-w-1 w-1 basis-1 flex-shrink-0 {getColor(
      entry.status
    )} rounded-md"
    style="height: 98%;"
  />
  <div class="w-full flex flex-wrap items-center col-span-full gap-1">
    <div class="flex flex-1"><p>{entry.status.toUpperCase()}</p></div>

    <div class="flex gap-4">
      <p class="hidden lg:flex items-center gap-1">
        {#if entry.dateStarted}
          {formatShort(entry.dateStarted)}
          <span class="icon" title="date started"><EventProgress /></span>
        {:else}
          <span class="flex-shrink leading-4"> ??? </span>
        {/if}
      </p>

      <span class="hidden lg:inline">-</span>

      <p class="hidden lg:flex items-center gap-1">
        {#if entry.dateFinished}
          {formatShort(entry.dateFinished)}
          <span class="icon" title="date read"><EventDone /></span>
        {:else}
          <span class="flex-shrink leading-4"> ? </span>
        {/if}

        {#if entry.dateFinished != null && entry.dateStarted != null}
          <span>:</span>
        {/if}
      </p>

      <div
        title={`${formatShort(entry.dateStarted)} to ${formatShort(
          entry.dateFinished
        )}`}
      >
        {#if entry.dateFinished != null && entry.dateStarted != null}
          <p class="flex items-center gap-1">
            {dateDiffFormatted(
              optionalToDate(entry.dateStarted),
              optionalToDate(entry.dateFinished)
            )}

            <span class="w-5 block mt-0.5 lg:hidden">
              <InfoIcon />
            </span>
          </p>
        {/if}
      </div>
    </div>

    {#if entry.rating}
      <div class="flex sm:gap-2 gap-1 items-center justify-end flex-1">
        <p>{entry.rating.stars} / {MAX_RATING}</p>
        <span class="icon" aria-label="stars"><IoIosStar /></span>
      </div>
    {/if}

    <div class="flex justify-end ms-2 sm:ms-0 sm:flex-1">
      <span
        class="hidden lg:inline-flex flex-row divide-x overflow-hidden rounded-md border dark:border-none bg-white shadow-sm
            dark:bg-slate-600 dark:border-slate-700"
      >
        <button
          class="group inline-block p-2 hover:bg-gray-50 focus:relative
              dark:hover:bg-slate-500"
          title="View"
          type="button"
          on:click={() => {
            expanded = !expanded;
          }}
        >
          <span
            class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
          >
            <OpenNew />
          </span>
        </button>

        {#if $page.data.session}
          <button
            class="group inline-block p-2 hover:bg-gray-50 focus:relative
              dark:hover:bg-slate-500 border-none"
            title="Edit book"
            type="button"
            on:click={() => {
              editExpanded = true;
            }}
          >
            <span
              class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
            >
              <IoMdSettings />
            </span>
          </button>

          <slot name="delete">
            {#if allow_deletion}
              <button
                class="group p-2 btn-delete hidden sm:inline-block !border-none"
                title="Delete book"
                type="button"
                on:click={() => {
                  // dispatch("delete", { book });
                  deleteExpanded = true;
                }}
              >
                <span
                  class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
                >
                  <IoMdTrash alt="red trash can" />
                </span>
              </button>
            {/if}
          </slot>
        {/if}
      </span>

      <Dropdown
        className="lg:!hidden !flex items-center"
        contentClass="!py-0"
        closeOnClick={true}
        buttonClass="btn-generic btn-generic-color-2 generic-border dark:border-slate-600 p-1"
      >
        <span
          slot="triggerContent"
          aria-label="open dropdown"
          class="block w-5"
        >
          <DropdownIcon />
        </span>

        <ul
          slot="dropdown"
          class="flex flex-col gap-1 p-4 sm:px-1 sm:py-1 w-56 sm:w-36 text-sm text-gray-700 dark:text-gray-200"
        >
          <li>
            <button
              on:click={() => {
                expanded = !expanded;
              }}
              class="dropdown-item-button"
              type="button"
            >
              <span
                class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
              >
                <OpenNew />
              </span>
              Open
            </button>
          </li>

          {#if $page.data.session}
            <li>
              <button
                on:click={() => {
                  editExpanded = !editExpanded;
                }}
                class="dropdown-item-button"
                type="button"
              >
                <span
                  class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
                >
                  <IoMdSettings />
                </span>
                Settings
              </button>
            </li>
          {/if}

          {#if allow_deletion}
            <li>
              <button
                on:click={() => {
                  deleteExpanded = !deleteExpanded;
                }}
                class="dropdown-item-button text-error"
                type="button"
              >
                <span
                  class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
                >
                  <IoMdTrash alt="red trash can" />
                </span>
                Delete
              </button>
            </li>
          {/if}
        </ul>
      </Dropdown>
    </div>
  </div>
</div>

<Modal
  bind:showModal={expanded}
  divClassName="w-full"
  className="w-[95%] lg:w-2/5"
>
  <div class="flex items-center gap-4 w-full" slot="header">
    <p class="font-medium">Reading Activity</p>

    <div class="flex items-center gap-2">
      <p class="flex items-center gap-1">
        {#if entry.dateStarted}
          {formatShort(entry.dateStarted)}
          <span class="icon" title="date started"><EventProgress /></span>
        {:else}
          <span class="flex-shrink leading-4"> ??? </span>
        {/if}
      </p>

      <span>-</span>

      <p class="flex items-center gap-1">
        {#if entry.dateFinished}
          {formatShort(entry.dateFinished)}
          <span class="icon" title="date read"><EventDone /></span>
        {:else}
          <span class="flex-shrink leading-4"> ? </span>
        {/if}
      </p>
    </div>
  </div>

  <section class="mt-5">
    <h2 class="text-xl">Review</h2>
    <p class="text-secondary">{entry.rating?.comment ?? "No comment added"}</p>
  </section>

  {#if entry.storyGraphs.length > 0}
    <section class="mt-5">
      <h2 class="text-xl mb-1">Story graphs</h2>
      <div class="default-border p-2">
        <LineChartDrawer
          allowEdits={false}
          bind:title={tensionGraph.title}
          bind:labels={tensionGraph.labels}
          bind:details={tensionGraph.details}
          bind:data={tensionGraph.data}
        />
        <input type="hidden" name="graphs[title]" value={tensionGraph.title} />
        <input
          type="hidden"
          name="graphs[labels]"
          value={JSON.stringify(tensionGraph.labels)}
        />
        <input
          type="hidden"
          name="graphs[details]"
          value={JSON.stringify(tensionGraph.details)}
        />
        <input
          type="hidden"
          name="graphs[data]"
          value={JSON.stringify(tensionGraph.data)}
        />
      </div>
    </section>
  {/if}

  <p class="text-secondary mt-5 -mb-4 text-sm text-end">
    Created at: {entry.createdAt.toLocaleString()}
  </p>
</Modal>

<ReadingActivityForm bind:showModal={editExpanded} {entry} />

<ReadingActivityDeletePopUp
  deletionEntry={entry}
  bind:openModal={deleteExpanded}
  on:success={() => {
    deleteExpanded = false;
    invalidateAll();
  }}
/>

<style lang="postcss">
  .icon {
    width: 20px;
    height: 20px;
  }
  .icon-edit {
    width: 20px;
    height: 20px;
  }

  .book-item-grid {
    display: grid;
    flex-grow: 1;
    grid-template-rows: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    row-gap: 0;
    align-items: center;
    height: 100%;
    /* grid-template-columns: repeat(auto-fit, minmax(50px, 1fr)); */
    grid-template-rows: auto;
  }

  @media (min-width: 640px) {
    .book-item-grid {
      grid-template-rows: repeat(1, minmax(0, 1fr));
    }
  }
</style>
