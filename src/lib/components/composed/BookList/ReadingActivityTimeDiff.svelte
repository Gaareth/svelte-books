<script lang="ts">
  import type { ReviewListItemType } from "$appTypes";
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
  import { formatShort } from "$components/input/DateSelector.svelte";
  import CalenderAdd from "$lib/icons/CalenderAdd.svelte";
  import EventDone from "$lib/icons/EventDone.svelte";
  import EventProgress from "$lib/icons/EventProgress.svelte";
  import InfoIcon from "$lib/icons/InfoIcon.svelte";
  import {
    dateToYYYY_MM_DD,
    dateDiffFormatted,
    optionalToDate,
  } from "$lib/utils/utils";

  export let entry: ReviewListItemType;

  $: showStart = entry.status.status === READING_ACTIVITY_TYPES.ACQUIRED;

  $: showStartandEnd =
    entry.status.status === READING_ACTIVITY_TYPES.READING ||
    entry.status.status === READING_ACTIVITY_TYPES.FINISHED ||
    entry.status.status === READING_ACTIVITY_TYPES.PAUSED ||
    entry.status.status === READING_ACTIVITY_TYPES.DID_NOT_FINISH;
</script>

<div class="flex gap-4">
  {#if showStart}
    <p class="flex items-center gap-1">
      {formatShort(entry.dateStarted)}
      <span class="icon" title="date started"><EventProgress /></span>
    </p>
  {:else if !showStartandEnd}
    <p class="flex items-center gap-1">
      {dateToYYYY_MM_DD(entry.createdAt)}
      <span class="icon" title="date of activity"><CalenderAdd /></span>
    </p>
  {:else}
    <p class="flex items-center gap-1">
      {#if entry.dateStarted}
        {formatShort(entry.dateStarted)}
        <span class="icon" title="date started"><EventProgress /></span>
      {:else}
        <span class="flex-shrink leading-4">?</span>
      {/if}
    </p>

    <span class="inline">-</span>

    <p class="flex items-center gap-1">
      {#if entry.dateFinished}
        {formatShort(entry.dateFinished)}
        <span class="icon" title="date read"><EventDone /></span>
      {:else}
        <span class="flex-shrink leading-4">?</span>
      {/if}

      {#if entry.dateFinished != null && entry.dateStarted != null}
        <span>:</span>
      {/if}
    </p>

    <div
      title={`${formatShort(entry.dateStarted)} to ${formatShort(
        entry.dateFinished
      )}`}>
      {#if entry.dateFinished != null && entry.dateStarted != null}
        <p class="flex items-center gap-1">
          {dateDiffFormatted(
            optionalToDate(entry.dateStarted),
            optionalToDate(entry.dateFinished)
          )}

          <span class="w-5 block mt-0.5">
            <InfoIcon />
          </span>
        </p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .icon {
    width: 20px;
    height: 20px;
  }
</style>
