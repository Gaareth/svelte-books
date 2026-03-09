<script lang="ts">
  import { getContext, onMount } from "svelte";

  import { twMerge } from "tailwind-merge";

  import { TABS, type TabsContext } from "./TabGroup.svelte";

  let panel = {};
  let thisPanel: HTMLDivElement;
  const { registerPanel, selectedPanel, setPanelRef } =
    getContext<TabsContext>(TABS);

  export let className: string | undefined = undefined;

  let i = registerPanel(panel);
  onMount(() => {
    setPanelRef(i, thisPanel);
  });
</script>

<!-- {#if $selectedPanel === panel}
	<slot></slot>
{/if} -->

<div
  hidden={$selectedPanel !== panel}
  class={twMerge("min-w-full", className)}
  bind:this={thisPanel}>
  <slot />
</div>
