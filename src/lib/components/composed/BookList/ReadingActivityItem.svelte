<script context="module" lang="ts">
  export type ItemDeleteEvent = { book: Book };
</script>

<script lang="ts">
  import { type Book } from "$prismaBrowser";
  //@ts-ignore
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
  //@ts-ignore
  import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
  //@ts-ignore
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";

  import ReadingActivityForm from "./ReadingActivityForm.svelte";
  import { MAX_RATING } from "$lib/constants/constants";

  import { invalidateAll } from "$app/navigation";
  import { type ReviewListItemType } from "$appTypes";
  import Dropdown from "$components/input/Dropdown.svelte";
  import DropdownIcon from "$lib/icons/DropdownIcon.svelte";
  import EventDone from "$lib/icons/EventDone.svelte";
  import EventProgress from "$lib/icons/EventProgress.svelte";
  import InfoIcon from "$lib/icons/InfoIcon.svelte";
  import OpenNew from "$lib/icons/OpenNew.svelte";
  import LineChartDrawer from "$components/input/LineChartDrawer.svelte";
  import Modal from "$components/Modal.svelte";
  import ReadingActivityDeletePopUp from "$components/composed/BookList/ReadingActivityDeletePopUp.svelte";
  import {
    dateDiffFormatted,
    dateToYYYY_MM_DD,
    displayReadingActivityStatus,
    optionalToDate,
  } from "$lib/utils/utils";
  import {
    READING_ACTIVITY_TYPES,
    type ReadingActivityStatusType,
  } from "$lib/constants/enums";
  import AccentBarItemCard from "$lib/components/composed/AccentBarItemCard.svelte";
  import ReadingActivityTimeDiff from "$components/composed/BookList/ReadingActivityTimeDiff.svelte";

  export let entry: ReviewListItemType;
  export let isAuthorizedToModify = false;

  // export let deletionBook: Book | undefined = undefined;
  // export let openModal: boolean = false;
  export let allow_deletion: boolean | undefined = true;

  let expanded = false;
  let editExpanded = false;
  let deleteExpanded = false;

  const getColor = (statuss: string) => {
    const status = statuss as ReadingActivityStatusType;

    switch (status) {
      case READING_ACTIVITY_TYPES.READING:
        return "bg-yellow-500";
      case READING_ACTIVITY_TYPES.DID_NOT_FINISH:
        return "bg-red-600";
      case READING_ACTIVITY_TYPES.FINISHED:
        return "bg-green-500";
      case READING_ACTIVITY_TYPES.PAUSED:
        return "bg-gray-500";
      case READING_ACTIVITY_TYPES.TO_READ:
        return "bg-blue-500";
      case READING_ACTIVITY_TYPES.ACQUIRED:
        return "bg-purple-500";
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

  let dropdownOpen = false;
  $: statusDisplayName = displayReadingActivityStatus(entry.status.status);
</script>

<AccentBarItemCard
  barClass={getColor(entry.status.status)}
  role="button"
  tabindex="0"
  on:dblclick={() => {
    if (window.innerWidth < 1024) {
      dropdownOpen = true;
    }
  }}>
  <div>
    <div class="w-full flex flex-wrap items-center col-span-full gap-1">
      <div class="flex flex-1"><p>{statusDisplayName}</p></div>

      <ReadingActivityTimeDiff {entry} />

      {#if entry.rating?.stars}
        <div class="flex sm:gap-2 gap-1 items-center justify-end flex-1">
          <p>{entry.rating.stars} / {MAX_RATING}</p>
          <span class="icon" aria-label="stars"><IoIosStar /></span>
        </div>
      {/if}

      <div class="flex justify-end ms-2 sm:ms-0 sm:flex-1">
        <span
          class="hidden lg:inline-flex flex-row divide-x overflow-hidden rounded-md border dark:border-none bg-white shadow-sm
            dark:bg-slate-600 dark:border-slate-700">
          <button
            class="group inline-block p-2 hover:bg-gray-50 focus:relative
              dark:hover:bg-slate-500"
            title="View"
            type="button"
            on:click={() => {
              expanded = !expanded;
            }}>
            <span
              class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
              <OpenNew />
            </span>
          </button>

          {#if isAuthorizedToModify}
            <button
              class="group inline-block p-2 hover:bg-gray-50 focus:relative
              dark:hover:bg-slate-500 border-none"
              title="Edit book"
              type="button"
              on:click={() => {
                editExpanded = true;
              }}>
              <span
                class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
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
                  }}>
                  <span
                    class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
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
          bind:open={dropdownOpen}
          buttonClass="btn-generic btn-generic-color-2 generic-border dark:border-slate-600 p-1">
          <span
            slot="triggerContent"
            aria-label="open dropdown"
            class="block w-5">
            <DropdownIcon />
          </span>

          <ul
            slot="dropdown"
            class="flex flex-col gap-1 p-4 sm:px-1 sm:py-1 w-56 sm:w-36 text-sm text-gray-700 dark:text-gray-200">
            <li>
              <button
                on:click={() => {
                  expanded = !expanded;
                }}
                class="dropdown-item-button"
                type="button">
                <span
                  class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
                  <OpenNew />
                </span>
                Open
              </button>
            </li>

            {#if isAuthorizedToModify}
              <li>
                <button
                  on:click={() => {
                    editExpanded = !editExpanded;
                  }}
                  class="dropdown-item-button"
                  type="button">
                  <span
                    class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
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
                  type="button">
                  <span
                    class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
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
</AccentBarItemCard>

<Modal
  bind:showModal={expanded}
  divClassName="w-full"
  className="w-[95%] lg:w-2/5">
  <div class="flex items-center gap-4 w-full" slot="header">
    <p class="font-medium">Reading Activity</p>

    <ReadingActivityTimeDiff {entry} />
  </div>

  <section class="mt-5">
    <div class="flex items-center gap-3">
      <h2 class="text-xl">Review</h2>

      {#if entry.rating?.stars}
        <div class="flex gap-1 items-center">
          <p>{entry.rating.stars} / {MAX_RATING}</p>
          <span class="icon" aria-label="stars"><IoIosStar /></span>
        </div>
      {/if}
    </div>

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
          bind:data={tensionGraph.data} />
        <input type="hidden" name="graphs[title]" value={tensionGraph.title} />
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
  }} />

<style lang="postcss">
  .icon {
    width: 20px;
    height: 20px;
  }
  .icon-edit {
    width: 20px;
    height: 20px;
  }
</style>
