<script lang="ts">
  import type { ReviewListItemType } from "$appTypes";
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
  import NowReadingAction from "./NowReadingAction.svelte";
  import DoneReadingAction from "./DoneReadingAction.svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import toast from "svelte-french-toast";
  import PausedReadingAction from "./PausedReadingAction.svelte";
  import StoppedReadingAction from "./StoppedReadingAction.svelte";
  import AcquiredAction from "./AcquiredAction.svelte";
  import ContinueReadingAction from "./ContinueReadingAction.svelte";

  export let activeEntry: ReviewListItemType;
  export let readingActivities: ReviewListItemType[];
  export let className = "";

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
        className={`group toggle-btn px-3 py-2 
        ${i === 0 ? "toggle-btn-start" : ""} 
        ${i === actions.length - 1 ? "toggle-btn-end" : ""}`} />
    {/each}
  </div>
</form>
