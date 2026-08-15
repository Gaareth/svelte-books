<script lang="ts">
    import { type ChartTypeRegistry } from "chart.js/auto";
    import { Chart, getElementAtEvent } from "svelte-chartjs";
    import "chart.js/auto";


    import type { Chart as ChartJS } from "chart.js";

    import { theme } from "$lib/stores/stores";
    import MoreDots from "$src/lib/icons/MoreDots.svelte";
    import RestartRounded from "$src/lib/icons/RestartRounded.svelte";
    import { defaultBgColor, tupleToDataset } from "$utils/chartUtils";
    import SortDescendingIcon from "$src/lib/icons/SortDescendingIcon.svelte";
    import SortAscendingIcon from "$src/lib/icons/SortAscendingIcon.svelte";

    interface Props {
        data: [any, number][];
        type?: keyof ChartTypeRegistry;
        label?: string;
        removeOnClick?: boolean;
        [key: string]: any;
    }

    let {
        data = $bindable(),
        type = "bar",
        label = "# books read",
        removeOnClick = false,
         
        ...rest
    }: Props = $props();

    let chart = $state<ChartJS | null>(null);

    let initialMaxShown = 10;
    let maxShown = $state(initialMaxShown);
    let initialData = data.slice(0, data.length);

    type DataSet = {
        data: number[];
        label: string;
        backgroundColor?: string | undefined;
    };
    let displayData: {
        labels: any[];
        datasets: DataSet[];
    } = $derived.by(() => {
        {
            let d: { labels: any[]; datasets: DataSet[] } = tupleToDataset(
                data.slice(0, maxShown),
                label,
            );
            d.datasets[0].backgroundColor = defaultBgColor;
            return d;
        }
    });

    let fgColor = $derived($theme == "dark" ? "white" : "dark");

    let options = $derived({
        scales: {
            y: { ticks: { color: fgColor } },
            x: { ticks: { color: fgColor } },
        },
        plugins: {
            legend: {
                labels: { color: fgColor },
            },
        },
    });

    function removeClicked(e: MouseEvent) {
        if (!removeOnClick) return;

        // @ts-ignore
        const el = getElementAtEvent(chart, e);
        const labelIndex = el[0].index;
        data.splice(labelIndex, 1);
        data = [...data]; // trigger reactivity
    }

    let isSortedAsc = $state(false);
    function sortData() {
        data.sort((a, b) => (isSortedAsc ? b[1] - a[1] : a[1] - b[1]));
        data = [...data]; // trigger reactivity
        isSortedAsc = !isSortedAsc;
    }

    function resetOrder() {
        maxShown = initialMaxShown;
        data = [...initialData];
    }
</script>

<div>
    <div class="ml-auto w-fit">
        <div class="my-3 inline-flex">
            <button
                class="btnClass icon-wrapper"
                onclick={sortData}
                title={isSortedAsc ? "sort descending" : "sort ascending"}>
                <span class="inline-block w-5">
                    {#if isSortedAsc}
                        <SortDescendingIcon />
                    {:else}
                        <SortAscendingIcon />
                    {/if}
                </span>
            </button>
            <button
                class="btnClass icon-wrapper"
                onclick={() => (maxShown = data.length)}
                title="show all">
                <span class="inline-block w-5">
                    <MoreDots />
                </span>
            </button>
            <!-- <button class="btnClass">clip</button> TODO: clip items in the middle, replace with ...-->
            <button
                class="btnClass icon-wrapper"
                onclick={resetOrder}
                title="reset order">
                <span class="inline-block w-5">
                    <RestartRounded />
                </span>
            </button>
        </div>
    </div>

    <Chart
        {type}
        bind:chart
        data={displayData}
        {options}
        onclick={removeClicked}
        {...rest} />
</div>

<style lang="postcss">
    .btnClass {
        @apply px-4 py-1 hover:bg-gray-50 dark:hover:bg-slate-500 dark:bg-slate-600 dark:border-slate-500 border border-s-0;
    }

    .btnClass:first-child {
        @apply rounded-s-md border-s;
    }

    .btnClass:last-child {
        @apply rounded-e-md border-e;
    }
</style>
