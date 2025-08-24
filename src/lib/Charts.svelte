<script lang="ts">
  import { Chart, getElementAtEvent } from "svelte-chartjs";

  import "chart.js/auto";
  import { defaultBgColor, tupleToDataset } from "../chartUtils";
  import { theme } from "./stores/stores";

  import { type ChartTypeRegistry } from "chart.js/auto";

  let chart: any;
  export let data: [any, number][];
  export let type: keyof ChartTypeRegistry = "bar";

  let displayData: {
    labels: any[];
    datasets: {
      data: number[];
      label: string;
      backgroundColor?: string | undefined;
    }[];
  } = tupleToDataset(data.slice(0, 10), "# books read");

  displayData.datasets[0].backgroundColor = defaultBgColor;

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
  {type}
  bind:chart
  data={displayData}
  {options}
  on:click={(e) => {
    // @ts-ignore
    const el = getElementAtEvent(chart, e);
    const labelIndex = el[0].index;
    data.splice(labelIndex, 1);

    displayData = tupleToDataset(data.slice(0, 10), "# books read");
    displayData.datasets[0].backgroundColor = defaultBgColor;
  }}
  {...$$restProps} />
