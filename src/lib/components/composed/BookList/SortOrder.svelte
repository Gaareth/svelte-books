<script lang="ts">
    import { createEventDispatcher } from "svelte";

    //@ts-ignore
    import ArrowDown from "svelte-icons/io/IoMdArrowDropdown.svelte";
    //@ts-ignore
    import ArrowUp from "svelte-icons/io/IoMdArrowDropup.svelte";

    interface Props {
        reversed?: boolean;
    }

    let { reversed = $bindable(false) }: Props = $props();
    const dispatch = createEventDispatcher();
</script>

<button
    class="btn-generic-icon"
    onclick={() => {
        reversed = !reversed;
        dispatch("click");
    }}
    title="Reverse sort order">
    <span class="block w-6 h-6">
        {#if reversed}
            <ArrowDown />
        {:else}
            <ArrowUp />
        {/if}
    </span>
</button>
