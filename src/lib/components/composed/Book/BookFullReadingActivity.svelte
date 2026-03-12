<script lang="ts">
  import type { BookWithOwnership, ReviewListItemType } from "$appTypes";
  import ActiveIndicator from "$components/ActiveIndicator.svelte";
  import AddIcon from "$lib/icons/AddIcon.svelte";
  import InfoIcon from "$lib/icons/InfoIcon.svelte";
  import ReadingActivityActions from "$components/composed/BookList/Actions/ReadingActivityActions.svelte";
  import ReadingActivityItem from "$components/composed/ReadingActivity/ReadingActivityItem.svelte";

  export let book: BookWithOwnership;
  export let activeEntry: ReviewListItemType;
  export let readingActivitiesSorted: ReviewListItemType[];
  export let isAuthorizedToModify: boolean;
  export let showCreateReadingActivity: boolean;
</script>

<div class="">
  <div class="grid grid-cols-1 gap-1.5 mb-3 md:flex md:flex-wrap items-center">
    <div class="flex items-center gap-1 self-end">
      <h2 class="text-2xl text-end">Reading Activity</h2>
      <span
        class="block w-5 mt-0.5 text-secondary hover:text-inherit"
        title="Every activity regarding this book. Use the latest for tracking current rating and comments">
        <InfoIcon />
      </span>
    </div>
    {#if isAuthorizedToModify}
      <div class="md:ml-auto flex items-center gap-1">
        <ReadingActivityActions
          {activeEntry}
          readingActivities={readingActivitiesSorted} />

        <button
          type="button"
          class="ml-auto md:ml-0 btn-generic p-2 px-4 w-16 sm:w-auto flex justify-center"
          on:click={() => (showCreateReadingActivity = true)}
          title="Create reading activity">
          <span class="block w-5">
            <AddIcon />
          </span>
        </button>
      </div>
    {/if}
  </div>
  <!-- <hr class="border-slate-600 mt-2" /> -->
  {#each readingActivitiesSorted as readingActivity}
    <div class="relative">
      <ReadingActivityItem
        entry={readingActivity}
        {isAuthorizedToModify}
        {book} />

      {#if readingActivity == activeEntry}
        <div class="absolute top-[0.2rem] right-[0.2rem]">
          <ActiveIndicator size="sm" />
        </div>
      {/if}
    </div>
  {/each}

  {#if readingActivitiesSorted.length <= 0}
    <p class="text-secondary text-center">No reading activity found.</p>
  {/if}
</div>
