<script lang="ts">
    import toast from "svelte-french-toast";

    import OwnershipForm from "../OwnershipForm.svelte";
    import RatingForm from "./RatingForm.svelte";
    import {
        shouldShowRating,
        shouldShowFinishedDate,
        shouldShowStartedDate,
    } from "./utils";
    import ToggleGroup from "../../input/ToggleGroup.svelte";

    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { type BookWithOwnership, type ReviewListItemType } from "$appTypes";
    import DateSelector, {
        DEFAULT_OPTIONAL_DATETIME,
    } from "$components/input/DateSelector.svelte";
    import InputAny from "$components/input/InputAny.svelte";
    import InputSelect from "$components/input/InputSelect.svelte";
    import Modal from "$components/Modal.svelte";
    import {
        READING_ACTIVITY_TYPES,
        READING_STATUS_VALUES,
    } from "$lib/constants/enums";
    import EventDone from "$lib/icons/EventDone.svelte";
    import EventProgress from "$lib/icons/EventProgress.svelte";

    interface Props {
        book: BookWithOwnership;
        bookId?: string | undefined;
        showModal?: boolean;
        entry?: ReviewListItemType | undefined;
    }

    let {
        book,
        bookId = undefined,
        showModal = $bindable(false),
        entry = undefined,
    }: Props = $props();
    let createNew = $derived(entry === undefined);

    let readingStatus = $derived(entry?.status.status);

    let showRating = $derived(shouldShowRating(readingStatus));
    let showFinishedDate = $derived(shouldShowFinishedDate(readingStatus));
    let showStartedDate = $derived(shouldShowStartedDate(readingStatus));

    let error: Record<string, any> | undefined = $state(undefined);

    // Create separate copies to prevent DateSelector components from sharing the same object reference
    let dateStartedValue = $derived(
        entry?.dateStarted
            ? { ...entry.dateStarted }
            : { ...DEFAULT_OPTIONAL_DATETIME },
    );
    let dateFinishedValue = $derived(
        entry?.dateFinished
            ? { ...entry.dateFinished }
            : { ...DEFAULT_OPTIONAL_DATETIME },
    );

    let bookOwnership = $derived(book.ownership?.status);
    let location = $derived(book.ownership?.location);
</script>

<Modal bind:showModal divClassName="w-full" className="w-full lg:w-2/5">
    {#snippet header()}
        <div class="flex items-center gap-4 w-full">
            <p class="font-medium">
                {entry != null ? "Edit" : "Create"} Reading Activity
            </p>
        </div>
    {/snippet}

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
                        `Successfully ${
                            createNew ? "created" : "updated"
                        } reading activity`,
                    );
                    showModal = false;
                    error = undefined;
                } else {
                    //@ts-ignore
                    console.log("error", result.error);
                    //@ts-ignore
                    error = result.error;
                    //@ts-ignore
                    let msg = result.message ?? "Unknown error";

                    toast.error(
                        `Error ${
                            createNew ? "creating" : "updating"
                        } reading activity: ${msg}`,
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

            <div class="flex justify-center sm:mt-5">
                <ToggleGroup
                    options={READING_STATUS_VALUES}
                    groupClass="mb-2 inline-flex"
                    btnClass="px-2 py-2 sm:py-0 hover:bg-gray-50 dark:hover:bg-slate-500 border border-s-0 dark:border-slate-500 dark:bg-slate-600"
                    btnSelectedClass="dark:bg-slate-500 bg-gray-100"
                    startClass="border-s rounded-s-md"
                    endClass="rounded-e-md" />
            </div>

            {#if showStartedDate}
                <div>
                    <InputAny name="dateStarted" error={error?.dateStarted}>
                        {#snippet label()}
                            <div class="icon-wrapper">
                                <span class="w-5 block" title="date started">
                                    <EventProgress />
                                </span>
                                Date started:
                            </div>
                        {/snippet}

                        {#snippet input()}
                            <DateSelector
                                id="dateStarted"
                                name="dateStarted"
                                inputClassName="!w-full !input dark:bg-slate-600"
                                className="w-full"
                                datetime={dateStartedValue}
                                clearButton={true} />
                        {/snippet}
                    </InputAny>
                </div>
            {/if}

            {#if showFinishedDate}
                <div>
                    <InputAny name="dateFinished">
                        {#snippet label()}
                            <div class="icon-wrapper">
                                <span class="w-5 block" title="date read">
                                    <EventDone />
                                </span>
                                Date read:
                            </div>
                        {/snippet}

                        {#snippet input()}
                            <DateSelector
                                id="dateFinished"
                                name="dateFinished"
                                inputClassName="!w-full !input dark:bg-slate-600"
                                className="w-full"
                                datetime={dateFinishedValue}
                                clearButton={true} />
                        {/snippet}
                    </InputAny>
                </div>
            {/if}

            {#if showRating}
                <RatingForm {entry} />
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
                onclick={() => (showModal = false)}>
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
