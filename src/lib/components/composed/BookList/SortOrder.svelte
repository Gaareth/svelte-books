<script lang="ts">
    import ArrowDropDown from "$src/lib/icons/ArrowDropDown.svelte";
    import ArrowDropUp from "$src/lib/icons/ArrowDropUp.svelte";

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
    <span class="block">
        {#if reversed}
            <ArrowDropDown class="w-6 h-6" />
        {:else}
            <ArrowDropUp class="w-6 h-6" />
        {/if}
    </span>
</button>
