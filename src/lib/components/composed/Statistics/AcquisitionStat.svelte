<script lang="ts">
    import { getReadingActivityColor } from "$src/lib/constants/constants";
    import { TO_READ, ACQUIRED, READING } from "$src/lib/constants/enums";
    import DynamicArrow from "$src/lib/icons/DynamicArrow.svelte";
    import Stats from "$src/lib/components/Stats.svelte";
    import { get_average_acquisition_time } from "$src/lib/utils/statisticUtils";
    import type { ReadingActivityList } from "$src/app";
    interface Props {
        readingActivities: ReadingActivityList[];
    }

    let { readingActivities }: Props = $props();

    let avg_acquisition_time = $derived(
        get_average_acquisition_time(readingActivities),
    );

    let has_any_stat = $derived(
        avg_acquisition_time.avg_to_read_to_acquired_days.count > 0 ||
            avg_acquisition_time.avg_acquired_to_reading_days.count > 0 ||
            avg_acquisition_time.avg_to_read_to_reading_days.count > 0,
    );
</script>

{#snippet placeholder()}
    <div
        class="absolute -top-6 -left-2.5 z-10 bg-white/75 text-black dark:text-white dark:bg-slate-800/60 w-[105%] h-[135%] flex items-center justify-center rounded-sm">
        <p class="text-center">
            Add books to
            <span style="color: {getReadingActivityColor(ACQUIRED)};">
                acquired
            </span>
            and
            <span style="color: {getReadingActivityColor(TO_READ)};">
                to-read
            </span>
            to learn more about the time it takes you to pick up books.
        </p>
    </div>
{/snippet}

<Stats
    titleString="average acquisition time (days)"
    className="!bg-transparent backdrop-blur sm:col-span-7">
    {#snippet valueSnippet()}
        <div class="flex flex-col w-full gap-1.5 relative">
            {#if !has_any_stat}
                {@render placeholder()}
            {/if}

            <div  class:blur={!has_any_stat}>
                <div class="flex items-end gap-3 justify-between break-keep">
                    <p>To-Read</p>

                    <div class="flex flex-col text-center">
                        <p class="-mb-1 font-bold">
                            {#if avg_acquisition_time.avg_to_read_to_acquired_days.count > 0}
                                {avg_acquisition_time
                                    .avg_to_read_to_acquired_days.days}
                            {:else}
                                N/A
                            {/if}
                        </p>
                        <div>
                            <DynamicArrow
                                minThickness={4}
                                colorStart={getReadingActivityColor(TO_READ)}
                                colorEnd={getReadingActivityColor(ACQUIRED)} />
                        </div>
                    </div>

                    <p>Acquired</p>

                    <div class="flex flex-col text-center">
                        <p class="-mb-1 font-bold">
                            {#if avg_acquisition_time.avg_acquired_to_reading_days.count > 0}
                                {avg_acquisition_time
                                    .avg_acquired_to_reading_days.days}
                            {:else}
                                N/A
                            {/if}
                        </p>
                        <DynamicArrow
                            minThickness={4}
                            colorStart={getReadingActivityColor(ACQUIRED)}
                            colorEnd={getReadingActivityColor(READING)} />
                    </div>

                    <p>Reading</p>
                </div>

                <div class="text-center">
                    <p class="-mb-1 font-bold">
                        {#if avg_acquisition_time.avg_to_read_to_reading_days.count > 0}
                            {avg_acquisition_time.avg_to_read_to_reading_days
                                .days}
                        {:else}
                            N/A
                        {/if}
                    </p>
                    <DynamicArrow
                        maxThickness={1.5}
                        colorStart={getReadingActivityColor(TO_READ)}
                        colorEnd={getReadingActivityColor(READING)} />
                </div>
            </div>
        </div>
    {/snippet}
</Stats>
