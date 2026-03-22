<script>
  export let length = 200;

  export let thicknessRatio = 0.035;
  export let headLengthFactor = 4;
  export let headWidthFactor = 5;

  $: thickness = length * thicknessRatio;
  $: headLength = thickness * headLengthFactor;
  $: headWidth = thickness * headWidthFactor;
</script>

<svg
  viewBox={`0 0 ${length} ${headWidth}`}
  class="arrow text-neutral-900 dark:text-neutral-100">
  <line
    x1="0"
    y1={headWidth / 2}
    x2={length - headLength}
    y2={headWidth / 2}
    stroke="currentColor"
    stroke-width={thickness}
    stroke-linecap="round" />

  <polygon
    points={`
      ${length - headLength},0
      ${length},${headWidth / 2}
      ${length - headLength},${headWidth}
    `}
    fill="currentColor" />
</svg>

<style>
  .arrow {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
