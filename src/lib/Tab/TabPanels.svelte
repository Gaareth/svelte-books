<script lang="ts">
  import { getContext } from "svelte";
  import { TABS, type TabsContext } from "./TabGroup.svelte";
  import { twMerge } from "tailwind-merge";
  export let className: string | undefined = undefined;

  const { currentTabIdx, animate } = getContext<TabsContext>(TABS);
</script>

<div
  style={animate ? `transform: translateX(-${100 * $currentTabIdx}%)` : ""}
  class={twMerge("panels-wrapper", className)}
>
  <slot />
</div>

<style>
  .panels-wrapper {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
    position: relative;
    min-width: 100%;
    padding: 0 0 0.75rem;
    transition: all 0.45s ease-in-out;
    /* overflow: hidden; */
  }
</style>
