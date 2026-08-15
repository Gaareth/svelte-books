<script lang="ts">
    import SortAscendingIcon from "$src/lib/icons/SortAscendingIcon.svelte";
    import SortDescendingIcon from "$src/lib/icons/SortDescendingIcon.svelte";

    interface Props {
        descending?: boolean;
        onClick?: () => void;
    }

    let { descending = $bindable(false), onClick }: Props = $props();
</script>

<button
    class="btn-generic-icon"
    onclick={() => {
        descending = !descending;
        onClick?.();
    }}
    title="Reverse sort order">
    <span class="block">
        {#if descending}
            <SortDescendingIcon class="w-6 h-6" />
        {:else}
            <SortAscendingIcon class="w-6 h-6" />
        {/if}
    </span>
</button>
