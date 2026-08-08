<script lang="ts">
    
    interface Props {
        name: string;
        displayName?: string | undefined;
        // export let type: string = "text"
        error?: string | undefined | null;
        label?: import('svelte').Snippet;
        input?: import('svelte').Snippet;
    }

    let {
        name,
        displayName = undefined,
        error = undefined,
        label,
        input
    }: Props = $props();
</script>

<label for={name} class="capitalize">
    {#if label}{@render label()}{:else}{displayName}:{/if}
</label>
<div class="flex flex-col mb-3 sm:mb-0">
    {@render input?.()}

    {#if error}
        <span class="label-text-alt text-error">{error}</span>
    {/if}
</div>
