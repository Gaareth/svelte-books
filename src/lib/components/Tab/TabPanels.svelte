<script lang="ts">
    import { getContext } from "svelte";

    import { twMerge } from "tailwind-merge";

    import { TABS, type TabsContext } from "./TabGroup.svelte";
    interface Props {
        className?: string | undefined;
        children?: import('svelte').Snippet;
    }

    let { className = undefined, children }: Props = $props();

    const { currentTabIdx, animate } = getContext<TabsContext>(TABS);
</script>

<div
    style={animate ? `transform: translateX(-${100 * $currentTabIdx}%)` : ""}
    class={twMerge("panels-wrapper", className)}>
    {@render children?.()}
</div>

<style>
    .panels-wrapper {
        display: flex;
        flex-flow: row nowrap;
        align-items: flex-start;
        position: relative;
        min-width: 100%;
        padding: 0 0 0.75rem;
        transition: transform 0.45s ease-in-out;
        /* overflow: hidden; */
    }
</style>
