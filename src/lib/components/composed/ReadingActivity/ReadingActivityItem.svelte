<script module lang="ts">
    export type ItemDeleteEvent = { book: Book };
</script>

<script lang="ts">
    //@ts-ignore
    import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
    //@ts-ignore
    import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
    //@ts-ignore
    import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";

    import { shouldShowRating } from "./utils";
    import OwnershipForm from "../OwnershipForm.svelte";
    import ReadingActivityForm from "../ReadingActivity/ReadingActivityForm.svelte";

    import { invalidateAll } from "$app/navigation";
    import { type BookWithOwnership, type ReviewListItemType } from "$appTypes";
    import ReadingActivityDeletePopUp from "$components/composed/ReadingActivity/ReadingActivityDeletePopUp.svelte";
    import ReadingActivityTimeDiff from "$components/composed/ReadingActivity/ReadingActivityTimeDiff.svelte";
    import { DEFAULT_OPTIONAL_DATETIME } from "$components/input/DateSelector.svelte";
    import Dropdown from "$components/input/Dropdown.svelte";
    import LineChartDrawer from "$components/input/LineChartDrawer.svelte";
    import Modal from "$components/Modal.svelte";
    import AccentBarItemCard from "$lib/components/composed/AccentBarItemCard.svelte";
    import {
        getReadingActivityColor,
        MAX_RATING,
    } from "$lib/constants/constants";
    import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
    import DropdownIcon from "$lib/icons/DropdownIcon.svelte";
    import OpenNew from "$lib/icons/OpenNew.svelte";
    import { capitalize } from "$lib/utils/utils";
    import { type Book } from "$prismaBrowser";

    interface Props {
        book: BookWithOwnership;
        entry: ReviewListItemType;
        isAuthorizedToModify?: boolean;
        deleteSnippet?: import("svelte").Snippet;
        allow_deletion?: boolean;
    }

    let {
        book,
        entry,
        deleteSnippet,
        isAuthorizedToModify = false,
        allow_deletion = true,
    }: Props = $props();

    // export let deletionBook: Book | undefined = undefined;
    // export let openModal: boolean = false;

    let expanded = $state(false);
    let editExpanded = $state(false);
    let deleteExpanded = $state(false);

    let tensionGraph = $derived(
        entry.storyGraphs.length > 0
            ? {
                  labels: JSON.parse(entry.storyGraphs[0].labels),
                  details: JSON.parse(entry.storyGraphs[0].details),
                  data: JSON.parse(entry.storyGraphs[0].data),
                  title: entry.storyGraphs[0].title,
              }
            : {
                  title: "tension", // the rest is default in the component
              },
    );

    let dropdownOpen = $state(false);
    let statusDisplayName = $derived(capitalize(entry.status.status));

    let showRating = $derived(shouldShowRating(entry.status.status));

    let dateStartedValue = $derived(
        entry?.dateStarted
            ? { ...entry.dateStarted }
            : { ...DEFAULT_OPTIONAL_DATETIME },
    );
</script>

<AccentBarItemCard
    wrapperClass=""
    accentStyle={"background-color: " +
        getReadingActivityColor(entry.status.status)}
    role="button"
    tabindex="0"
    on:dblclick={() => {
        if (window.innerWidth < 1024) {
            dropdownOpen = true;
        }
    }}>
    <div>
        <div class="w-full flex flex-wrap items-center col-span-full gap-2">
            <div class="flex flex-1"><p>{statusDisplayName}</p></div>

            <ReadingActivityTimeDiff {entry} />

            {#if entry.rating?.stars != null}
                <div
                    class="flex sm:gap-2 gap-1 items-center justify-end flex-1">
                    <p class="whitespace-nowrap">
                        {entry.rating.stars} / {MAX_RATING}
                    </p>
                    <span class="icon flex-shrink-0" aria-label="stars">
                        <IoIosStar />
                    </span>
                </div>
            {/if}

            <div class="flex justify-end sm:flex-1">
                <span
                    class="hidden lg:inline-flex flex-row divide-x overflow-hidden rounded-md border dark:border-none bg-white shadow-sm
            dark:bg-slate-600 dark:border-slate-700">
                    <button
                        class="group inline-block p-2 hover:bg-gray-50 focus:relative
              dark:hover:bg-slate-500"
                        title="View"
                        type="button"
                        onclick={() => {
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
                            onclick={() => {
                                editExpanded = true;
                            }}>
                            <span
                                class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
                                <IoMdSettings />
                            </span>
                        </button>

                        {#if deleteSnippet}
                            {@render deleteSnippet()}
                        {:else if allow_deletion}
                            <button
                                class="group p-2 btn-delete hidden sm:inline-block !border-none"
                                title="Delete book"
                                type="button"
                                onclick={() => {
                                    // dispatch("delete", { book });
                                    deleteExpanded = true;
                                }}>
                                <span
                                    class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
                                    <IoMdTrash alt="red trash can" />
                                </span>
                            </button>
                        {/if}
                    {/if}
                </span>

                <Dropdown
                    className="lg:!hidden !flex items-center"
                    contentClass="!py-0"
                    closeOnClick={true}
                    bind:open={dropdownOpen}
                    buttonClass="btn-generic btn-generic-color-2 generic-border dark:border-slate-600 p-1">
                    {#snippet triggerContent()}
                        <span aria-label="open dropdown" class="block w-5">
                            <DropdownIcon />
                        </span>
                    {/snippet}

                    {#snippet dropdown()}
                        <ul
                            class="flex flex-col gap-1 p-4 sm:px-1 sm:py-1 w-56 sm:w-36 text-sm text-gray-700 dark:text-gray-200">
                            <li>
                                <button
                                    onclick={() => {
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
                                        onclick={() => {
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
                                        onclick={() => {
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
                    {/snippet}
                </Dropdown>
            </div>
        </div>
    </div>
</AccentBarItemCard>

<Modal
    bind:showModal={expanded}
    divClassName="w-full"
    className="w-[95%] lg:w-2/5">
    {#snippet header()}
        <div class="flex items-center gap-4 w-full">
            <p class="font-medium">Reading Activity</p>

            <ReadingActivityTimeDiff {entry} />
        </div>
    {/snippet}

    {#if entry.status.status == READING_ACTIVITY_TYPES.ACQUIRED}
        <OwnershipForm
            className="my-5"
            editable={false}
            acquiredAtDate={dateStartedValue}
            bookOwnership={book.ownership?.status}
            location={book.ownership?.location} />
    {/if}

    {#if showRating}
        <section class="mt-5">
            <div class="flex items-center gap-3">
                <h2 class="text-xl">Review</h2>

                {#if entry.rating?.stars != null}
                    <div class="flex gap-1 items-center">
                        <p>{entry.rating.stars} / {MAX_RATING}</p>
                        <span class="icon" aria-label="stars">
                            <IoIosStar />
                        </span>
                    </div>
                {/if}
            </div>

            <p class="text-secondary">
                {entry.rating?.comment ?? "No comment added"}
            </p>
        </section>
    {/if}

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
        </section>
    {/if}

    <p class="text-secondary mt-5 -mb-4 text-sm text-end">
        Created at: {entry.createdAt.toLocaleString()}
    </p>
</Modal>

<ReadingActivityForm bind:showModal={editExpanded} {entry} {book} />

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
