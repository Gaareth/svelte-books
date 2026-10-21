<script lang="ts">
    import { getReadingActivityColor } from "$src/lib/utils/readingActivityUtils";
    import { READING, FINISHED } from "$src/lib/constants/enums";
    import DynamicArrow from "$src/lib/icons/DynamicArrow.svelte";
    import Stats from "$src/lib/components/Stats.svelte";
    import { get_avg_time_between_reads } from "$src/lib/utils/statisticUtils";
    import type { ReadingActivityList } from "$src/app";
    import { formatDuration } from "$src/lib/utils/dateUtils";
    interface Props {
        readingActivities: ReadingActivityList[];
    }

    let { readingActivities }: Props = $props();

    let time_between_reads_stat = $derived(
        get_avg_time_between_reads(readingActivities),
    );

    let time_between_reads = $derived(
        time_between_reads_stat.averageTimeBetweenReads_ms,
    );

    let has_stat = $derived(time_between_reads_stat.count > 0);
</script>

{#if has_stat }
    <Stats
        titleString="average time between reads"
        className="!bg-transparent backdrop-blur sm:col-span-7">
        {#snippet valueSnippet()}
            <div class="flex flex-col w-full gap-1.5 relative">
                <div class="flex items-end gap-3 justify-between break-keep">
                    <p class="hidden md:block">Finished/Paused/DNF</p>
                    <p class="block md:hidden">Finished</p>

                    <div class="flex flex-col text-center">
                        <p class="-mb-1 font-bold">
                            {formatDuration(time_between_reads)}
                        </p>
                        <div>
                            <DynamicArrow
                                thicknessRatio={0.025}
                                colorStart={getReadingActivityColor(FINISHED)}
                                colorEnd={getReadingActivityColor(READING)} />
                        </div>
                    </div>

                    <p>Reading</p>
                </div>
            </div>
        {/snippet}
    </Stats>
{/if}
