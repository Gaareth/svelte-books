<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import InputAny from "./InputAny.svelte";


    
    interface Props {
        value?: unknown | null;
        name: string;
        displayName?: string | undefined;
        // export let type: string = "text"
        error?: string | undefined | null;
        inputClass?: string;
        label?: import('svelte').Snippet;
        [key: string]: any
    }

    let {
        value = $bindable(),
        name,
        displayName = name,
        error = undefined,
        inputClass = "",
        label,
        ...rest
    }: Props = $props();

    const label_render = $derived(label);
</script>

<InputAny {displayName} {name} {error} {...rest}>
    {#snippet label()}
        {#if label_render}{@render label_render()}{:else}{displayName}{/if}
    {/snippet}
    {#snippet input()}
        <input
            
            id={name}
            {name}
            class={twMerge("input w-full", error ? "input-error" : "", inputClass)}
            {...rest}
            bind:value />
    {/snippet}
</InputAny>
