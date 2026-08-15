<script lang="ts">
    import toast from "svelte-french-toast";

    import DeleteAction from "./DeleteAction.svelte";
    import DoneReadingAction from "./DoneReadingAction.svelte";
    import NowReadingAction from "./NowReadingAction.svelte";

    import type { ReadingListItemType } from "$appTypes";

    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
    import SettingsHeart from "$src/lib/icons/SettingsHeart.svelte";
    import SettingsIcon from "$src/lib/icons/SettingsIcon.svelte";

    interface Props {
        isAuthorizedToModify?: boolean;
        allow_deletion?: boolean | undefined;
        entry: ReadingListItemType;
        onDelete?: (entry: ReadingListItemType) => void;
        onDone?: (entry: ReadingListItemType) => void;
    }

    let {
        isAuthorizedToModify = false,
        allow_deletion = false,
        entry,
        onDelete,
        onDone,
    }: Props = $props();
    let book_url = $derived(encodeURIComponent(entry.book.name));
    let statusType = $derived(entry.status.status);
</script>

{#if isAuthorizedToModify}
    <div class="flex justify-end ms-2 sm:ms-0 sm:flex-1">
        <form
            action="/api/reading-activity/transform"
            method="POST"
            use:enhance={() => {
                return async ({ result, update }) => {
                    //@ts-ignore
                    if (result.success === true) {
                        await invalidateAll();
                        toast.success(`Successfully updated book!`);
                    } else {
                        toast.error("Failed updating book :(");
                    }
                };
            }}>
            <input type="hidden" name="readingActivityId" value={entry.id} />
            <!-- is already included in the buttons -->
            <!-- <input
        type="hidden"
        name="targetStatus"
        value={READING_ACTIVITY_TYPES.FINISHED} /> -->

            <span
                class="inline-flex flex-row divide-x overflow-hidden rounded-md border bg-white shadow-sm
            dark:bg-slate-600 dark:border-slate-700">
                <a
                    class="group inline-block p-2 hover:bg-gray-50 focus:relative
              dark:hover:bg-slate-500"
                    title="Edit book"
                    href="/book/{book_url}/?edit=true">
                    <span
                        class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
                        <SettingsIcon />
                    </span>
                </a>

                {#if statusType == READING_ACTIVITY_TYPES.ACQUIRED}
                    <!-- content here -->
                {:else if statusType == READING_ACTIVITY_TYPES.TO_READ}
                    <NowReadingAction />
                {:else if statusType == READING_ACTIVITY_TYPES.READING}
                    <DoneReadingAction onClick={() => onDone?.(entry)} />
                {:else if allow_deletion}
                    <DeleteAction onClick={() => onDelete?.(entry)} />
                {/if}
            </span>
        </form>
    </div>
{:else}
    <div class="hidden sm:flex justify-end ms-2">
        <a
            class="underline-hover"
            href="/{entry.account.username}/book/{book_url}">
            View
        </a>
    </div>
{/if}
