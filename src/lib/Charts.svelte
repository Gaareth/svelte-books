<script lang="ts">
  import {
    Chart,
    getDatasetAtEvent,
    getElementAtEvent,
    getElementsAtEvent,
  } from "svelte-chartjs";
  import "chart.js/auto";
  import { tupleToDataset } from "./utils";

  let chart: any;
  export let data: [any, number][];

  let displayData = tupleToDataset(data.slice(0, 10), "# books read");
</script>

<Chart
  type="bar"
  bind:chart
  data={displayData}
  on:click={(e) => {
    const el = getElementAtEvent(chart, e);
    const labelIndex = el[0].index;
    data.splice(labelIndex, 1);

    displayData = tupleToDataset(data.slice(0, 10), "# books read");
  }}
/>
