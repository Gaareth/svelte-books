<script lang="ts">

    import ArrowDown from "svelte-icons/io/IoMdArrowDropdown.svelte";
    import ArrowUp from "svelte-icons/io/IoMdArrowDropup.svelte";

    interface Props {
        reversed?: boolean;
        onClick?: () => void;
    }

    let { reversed = $bindable(false), onClick }: Props = $props();
</script>

<button
    class="btn-generic-icon"
    onclick={() => {
        reversed = !reversed;
        onClick?.();
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
