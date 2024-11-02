<script lang="ts">
  import {
    Chart,
    getDatasetAtEvent,
    getElementAtEvent,
    getElementsAtEvent,
  } from "svelte-chartjs";
  import "chart.js/auto";
  import { isDarkModeEnabled, tupleToDataset } from "./utils";
  import { theme } from "./stores/stores";

  let chart: any;
  export let data: [any, number][];

  let displayData: {
    labels: any[];
    datasets: {
      data: number[];
      label: string;
      backgroundColor?: string | undefined;
    }[];
  } = tupleToDataset(data.slice(0, 10), "# books read");
  let bgColor = "#9966FF";
  displayData.datasets[0].backgroundColor = bgColor;

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
</script>

<Chart
  type="bar"
  bind:chart
  data={displayData}
  {options}
  on:click={(e) => {
    // @ts-ignore
    const el = getElementAtEvent(chart, e);
    const labelIndex = el[0].index;
    data.splice(labelIndex, 1);

    displayData = tupleToDataset(data.slice(0, 10), "# books read");
    displayData.datasets[0].backgroundColor = bgColor;
  }}
  {...$$restProps}
/>
