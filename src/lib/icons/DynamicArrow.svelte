<script lang="ts">
  import { twMerge } from "tailwind-merge";
  import { clamp } from "../utils/utils";

  export let length = 200;

  export let minThickness = 4;
  export let maxThickness = 8;

  export let thicknessRatio = 0.04;
  export let headLengthFactor = 4;
  export let headWidthFactor = 5;

  export let className = "";

  export let colorStart: string | undefined = undefined;
  export let colorEnd = colorStart;

  $: thickness = clamp(length * thicknessRatio, minThickness, maxThickness);
  $: headLength = thickness * headLengthFactor;
  $: headWidth = thickness * headWidthFactor;

  const gradientId = `grad-${Math.random().toString(36).slice(2)}`;

  const defaultColor = colorStart ? `url(#${gradientId})` : "currentColor";
</script>

<svg
  viewBox={`0 0 ${length} ${headWidth}`}
  class={twMerge("arrow text-neutral-900 dark:text-neutral-100", className)}
  {...$$restProps}>
  <defs>
    <linearGradient
      id={gradientId}
      x1="0"
      y1="0"
      x2={length}
      y2="0"
      gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color={colorStart} />
      <stop offset="100%" stop-color={colorEnd} />
    </linearGradient>
  </defs>

  <line
    x1="0"
    y1={headWidth / 2}
    x2={length - headLength}
    y2={headWidth / 2}
    stroke={defaultColor}
    stroke-width={thickness}
    stroke-linecap="round" />

  <polygon
    points={`
      ${length - headLength},0
      ${length},${headWidth / 2}
      ${length - headLength},${headWidth}
    `}
    fill={defaultColor} />
</svg>

<style>
  .arrow {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
