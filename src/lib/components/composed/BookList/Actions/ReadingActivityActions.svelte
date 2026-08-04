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

    export let activeEntry: ReviewListItemType;
    export let readingActivities: ReviewListItemType[];
    export let className = "";

    // TODO: maybe allow creation here?
    let activeStatus: ReadingActivityStatusType;
    $: activeStatus = activeEntry.status.status;
    $: isAlreadyAcquired = readingActivities.some(
        (activity) => activity.status.status === READING_ACTIVITY_TYPES.ACQUIRED
    );

    let actions: any[] = [];

    $: {
        actions = [];
        if (activeStatus === READING_ACTIVITY_TYPES.PAUSED) {
            actions.push({ component: ContinueReadingAction });
            actions.push({ component: StoppedReadingAction });
        }

        if (
            activeStatus !== READING_ACTIVITY_TYPES.READING &&
            activeStatus !== READING_ACTIVITY_TYPES.PAUSED
        ) {
            actions.push({ component: NowReadingAction });
        } else if (activeStatus === READING_ACTIVITY_TYPES.READING) {
            actions.push({ component: DoneReadingAction });

            actions.push({ component: PausedReadingAction });
            actions.push({ component: StoppedReadingAction });
        }

        if (!isAlreadyAcquired) {
            actions.push({ component: AcquiredAction });
        }
    }

    let openModal = false;
</script>

<form
    class={className}
    action={`/api/reading-activity/transform`}
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
            <svelte:component
                this={action.component}
                on:done={() => {
                    openModal = true;
                }}
                className={`group toggle-btn px-3 py-2 
        ${i === 0 ? "toggle-btn-start" : ""} 
        ${i === actions.length - 1 ? "toggle-btn-end" : ""}`} />
        {/each}
    </div>
</form>

{#if activeEntry}
    <DonePopup entry={activeEntry} bind:openModal />
{/if}
