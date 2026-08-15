<script lang="ts">
    import toast from "svelte-french-toast";

    import AcquiredAction from "./AcquiredAction.svelte";
    import ContinueReadingAction from "./ContinueReadingAction.svelte";
    import DonePopup from "./DonePopup.svelte";
    import DoneReadingAction from "./DoneReadingAction.svelte";
    import NowReadingAction from "./NowReadingAction.svelte";
    import PausedReadingAction from "./PausedReadingAction.svelte";
    import StoppedReadingAction from "./StoppedReadingAction.svelte";

    import type { ReviewListItemType } from "$appTypes";

    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import {
        READING_ACTIVITY_TYPES,
        type ReadingActivityStatusType,
    } from "$lib/constants/enums";

    interface Props {
        activeEntry: ReviewListItemType;
        readingActivities: ReviewListItemType[];
        className?: string;
    }

    let { activeEntry, readingActivities, className = "" }: Props = $props();

    // TODO: maybe allow creation here?
    let activeStatus: ReadingActivityStatusType = $derived(
        activeEntry.status.status,
    );

    let isAlreadyAcquired = $derived(
        readingActivities.some(
            (activity) =>
                activity.status.status === READING_ACTIVITY_TYPES.ACQUIRED,
        ),
    );

    let actions: { Component: any, event?: string }[] = $derived.by(() => {
        const result = [];

        if (activeStatus === READING_ACTIVITY_TYPES.PAUSED) {
            result.push({ Component: ContinueReadingAction });
            result.push({ Component: StoppedReadingAction });
        }

        if (
            activeStatus !== READING_ACTIVITY_TYPES.READING &&
            activeStatus !== READING_ACTIVITY_TYPES.PAUSED
        ) {
            result.push({ Component: NowReadingAction });
        } else if (activeStatus === READING_ACTIVITY_TYPES.READING) {
            result.push({ Component: DoneReadingAction, event: "ondone" });
            result.push({ Component: PausedReadingAction });
            result.push({ Component: StoppedReadingAction });
        }

        if (!isAlreadyAcquired) {
            result.push({ Component: AcquiredAction });
        }

        return result;
    });

    let openModal = $state(false);
</script>

<form
    class={className}
    action="/api/reading-activity/transform"
    method="POST"
    use:enhance={() => {
        return async ({ result, update }) => {
            //@ts-ignore
            if (result.success === true) {
                await invalidateAll();
                toast.success(`Successfully updated reading activity!`);
            } else {
                toast.error("Failed updating reading activity :(");
            }
        };
    }}>
    <input type="hidden" name="readingActivityId" value={activeEntry.id} />
    <!-- is already included in the buttons -->
    <!-- <input
        type="hidden"
        name="targetStatus"
        value={READING_ACTIVITY_TYPES.FINISHED} /> -->

    <div class="flex">
        {#each actions as action, i}
            <action.Component
                // ondone={() => {
                //     openModal = true;
                // }}
                 {...(action.event ? { [action.event]: () => (openModal = true) } : {})}
                className={`group toggle-btn px-3 py-2 
                    ${i === 0 ? "toggle-btn-start" : ""} 
                    ${i === actions.length - 1 ? "toggle-btn-end" : ""}`} />
        {/each}
    </div>
</form>

{#if activeEntry}
    <DonePopup entry={activeEntry} bind:openModal />
{/if}
