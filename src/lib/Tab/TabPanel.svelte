<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { TABS, type TabsContext } from "./TabGroup.svelte";
  import { twMerge } from "tailwind-merge";

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

<div class={twMerge("min-w-full", className)} bind:this={thisPanel}>
    <slot />
</div>
