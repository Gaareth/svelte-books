<script lang="ts">
  import { Chart, getElementAtEvent } from "svelte-chartjs";

  import "chart.js/auto";
  import { defaultBgColor, tupleToDataset } from "$utils/chartUtils";
  import { theme } from "$lib/stores/stores";

  import { type ChartTypeRegistry } from "chart.js/auto";

  //@ts-ignore
  import SortDesc from "svelte-icons/fa/FaSortAmountDown.svelte";
  //@ts-ignore
  import SortAsc from "svelte-icons/fa/FaSortAmountUp.svelte";
  import RestartRounded from "$src/lib/icons/RestartRounded.svelte";
  import MoreDots from "$src/lib/icons/MoreDots.svelte";
  import { onMount } from "svelte";

  let chart: any;
  export let data: [any, number][];
  export let type: keyof ChartTypeRegistry = "bar";
  export let label = "# books read";
  export let removeOnClick = false;

  let maxShown = 10;
  let initialMaxShown = maxShown;
  let initialData = data.slice(0, data.length);

  let displayData: {
    labels: any[];
    datasets: {
      data: number[];
      label: string;
      backgroundColor?: string | undefined;
    }[];
  };

  $: {
    displayData = tupleToDataset(data.slice(0, maxShown), label);
    displayData.datasets[0].backgroundColor = defaultBgColor;

    console.log("up", maxShown);
  }

  $: fgColor = $theme == "dark" ? "white" : "dark";

  $: options = {
    scales: {
      y: { ticks: { color: fgColor } },
      x: { ticks: { color: fgColor } },
    },
    plugins: {
      legend: {
        labels: { color: fgColor },
      },
    },
  };

  function removeClicked(e: CustomEvent<any>) {
    if (!removeOnClick) return;

    // @ts-ignore
    const el = getElementAtEvent(chart, e);
    const labelIndex = el[0].index;
    data.splice(labelIndex, 1);
    data = [...data]; // trigger reactivity
  }

  let isSortedAsc = false;
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
        on:click={sortData}
        title={isSortedAsc ? "sort descending" : "sort ascending"}>
        <span class="inline-block w-5">
          {#if isSortedAsc}
            <SortDesc />
          {:else}
            <SortAsc />
          {/if}
        </span>
      </button>
      <button
        class="btnClass icon-wrapper"
        on:click={() => (maxShown = data.length)}
        title="show all">
        <span class="inline-block w-5">
          <MoreDots />
        </span>
      </button>
      <!-- <button class="btnClass">clip</button> TODO: clip items in the middle, replace with ...-->
      <button
        class="btnClass icon-wrapper"
        on:click={resetOrder}
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
    on:click={removeClicked}
    {...$$restProps} />
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
