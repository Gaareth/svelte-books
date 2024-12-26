<script lang="ts">
  import {
    Chart,
    getDatasetAtEvent,
    getElementAtEvent,
    getElementsAtEvent,
  } from "svelte-chartjs";
  import "chart.js/auto";
  import {
    Chart as ChartJS,
    Scale,
    type ChartOptions,
    type CoreScaleOptions,
    type Tick,
  } from "chart.js/auto";

  import { getRelativePosition } from "chart.js/helpers";

  import { theme } from "./stores/stores";
  import { defaultBgColor } from "../chartUtils";
  import Modal from "./Modal.svelte";
  import { clamp } from "./utils";
  import { onMount } from "svelte";

  export let allowEdits = false;
  export let title: string;

  let chart: any | null = null;
  let canvas: HTMLCanvasElement;

  const MIN_V = -10;
  const MAX_V = 10;

  let length = 20;

  // export let labelsJson: string;
  // $: {
  //   labelsJson = JSON.stringify(labels);
  // }

  // onMount(() => {
  //   labels = JSON.parse(labelsJson);
  // });

  export let labels: string[] = Array.from({ length }, (_, i) => String(i));
  export let details: string[] = Array.from({ length }, (_, i) => String());
  //@ts-ignore
  export let data: number[] = Array.from({ length }, (_, i) => null);

  const updateLength = (e: Event) => {
    let v = Number((e.target as HTMLInputElement)?.value);
    if (isNaN(v)) return;

    if (v > length) {
      let d = v - length;
      labels.push(...Array.from({ length: d }, (_, i) => String(length + i)));
      details.push(...new Array(d).fill(""));
      data.push(...new Array(d).fill(null));
    } else if (v < length) {
      labels.length = v;
      details.length = v;
      data.length = v;
    }

    length = v;
    chart!.update();
  };

  $: fgColor = $theme == "dark" ? "white" : "dark";

  $: grid = {
    color: $theme == "dark" ? "#334155" : "#",
  };

  // $: labelMaxWidth = chart.width / length;

  let options: ChartOptions;
  $: options = {
    responsive: true,
    scales: {
      y: {
        min: MIN_V,
        max: MAX_V,
        ticks: { color: fgColor },
        grid,
      },
      x: {
        ticks: {
          color: fgColor,
          maxRotation: 0,
          autoSkip: false,
          callback: function (
            this: Scale<CoreScaleOptions>,
            tickValue: string | number,
            index: number,
            ticks: Tick[]
          ): string {
            // Ensuring tickValue can be string or number, as expected
            let labelText = this.getLabelForValue(Number(tickValue));

            if (details[index].length > 0) {
              labelText += "(!)";
            }

            return isNaN(Number(labelText)) ? labelText : "";
          },
        },
        grid,
      },
    },
    spanGaps: true,
    plugins: {
      legend: {
        labels: { color: fgColor },
      },
    },
  };

  let isDrawing = false;

  let showModal = false;
  let eventInputRef: HTMLInputElement;
  let selectedLabelIndex: number;

  const startDrawing = (event: any): void => {
    isDrawing = true;
    options.animation = false;
  };

  const draw = (e: any): void => {
    if (!isDrawing) return;
    drawPoints(e);
  };

  const drawPoints = (e: any) => {
    if (chart == null) return;
    //@ts-ignore
    const canvasPosition = getRelativePosition(e, chart);
    const xValue = chart.scales.x.getValueForPixel(canvasPosition.x);
    const yValue = clamp(
      chart.scales.y.getValueForPixel(canvasPosition.y) ?? 0,
      MIN_V,
      MAX_V
    );
    if (xValue) {
      data[xValue] = Number(yValue.toFixed(2));
    } else {
      data[0] = Number(yValue.toFixed(2));
    }
  };

  const drawTouch = (event: TouchEvent | any): void => {
    if (!isDrawing) return;
    const touch = event.touches[0];
    drawPoints(touch);
    event.preventDefault(); // Prevent scrolling
  };

  const stopDrawing = (): void => {
    isDrawing = false;
    // options.animation = true;
  };
</script>

{#if allowEdits}
  <div class="mb-3">
    <!-- <h3 class="text-base">Chart Settings</h3> -->

    <div class="flex flex-wrap gap-5">
      <label>
        Title
        <input type="text" class="input w-auto" bind:value={title} />
      </label>

      <label>
        Length ({length})
        <input
          type="range"
          class="input w-auto h-full"
          on:input={updateLength}
          bind:value={length}
        />
      </label>
    </div>
  </div>
{/if}

<div class="relative">
  <canvas
    class="absolute w-full h-full block sm:hidden"
    bind:this={canvas}
    on:touchstart|preventDefault={startDrawing}
    on:touchmove={drawTouch}
    on:touchend|preventDefault={stopDrawing}
    on:touchcancel|preventDefault={stopDrawing}
  />

  <Chart
    bind:chart
    type="line"
    data={{
      labels,
      datasets: [
        {
          data,
          label: title,
          backgroundColor: defaultBgColor,
          borderColor: defaultBgColor,
        },
      ],
    }}
    {options}
    on:mousedown={startDrawing}
    on:mousemove={draw}
    on:mouseup={stopDrawing}
    on:mouseleave={stopDrawing}
    on:touchstart={startDrawing}
    on:touchmove={drawTouch}
    on:touchend={stopDrawing}
    on:touchcancel={stopDrawing}
    on:click={(e) => {
      //@ts-ignore
      const el = getElementAtEvent(chart, e);
      if (el[0] == null) return;
      selectedLabelIndex = el[0].index;

      showModal = true;
    }}
    {...$$restProps}
  />
</div>

<Modal
  bind:showModal
  className="max-w-96"
  on:opened={() => {
    eventInputRef.focus();
  }}
>
  <h1 slot="header" class="text-2xl">
    Additional information ({selectedLabelIndex})
  </h1>
  <div class="my-1 flex flex-col gap-2">
    <!-- todo: here floating label input -->
    <label class="text-secondary text-base">
      event:
      <input
        type="text"
        class="input btn-generic-color-2"
        bind:this={eventInputRef}
        bind:value={labels[selectedLabelIndex]}
      />
    </label>

    <label class="text-secondary text-base">
      details (!):
      <textarea
        class="input btn-generic-color-2"
        bind:value={details[selectedLabelIndex]}
      />
    </label>

    <p class="text-base text-secondary mt-2">
      You can enter some additional information why this point is especially
      important (to you!)
    </p>
  </div>
</Modal>

<style>
  label {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
</style>
