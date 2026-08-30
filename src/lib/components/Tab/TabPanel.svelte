<script lang="ts">
    import { getContext, onMount } from "svelte";

    import { twMerge } from "tailwind-merge";

    import { TABS, type TabsContext } from "./TabGroup.svelte";

    let panel = {};
    let thisPanel: HTMLDivElement | undefined = $state();
    const { registerPanel, selectedPanel, setPanelRef } =
        getContext<TabsContext>(TABS);

    interface Props {
        className?: string | undefined;
        children?: import('svelte').Snippet;
    }

    let { className = undefined, children }: Props = $props();

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
    {@render children?.()}
</div>
