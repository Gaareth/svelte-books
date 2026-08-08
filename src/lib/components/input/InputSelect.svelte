<script lang="ts">
    //@ts-ignore
    import IoIosRemoveCircle from "svelte-icons/io/IoIosRemoveCircle.svelte";
    import { twMerge } from "tailwind-merge";

    import InputAny from "./InputAny.svelte";

    interface Props {
        value: unknown | null;
        name: string;
        displayName?: string;
        clearButton?: boolean;
        selectClassName?: string;
        // export let type: string = "text"
        error?: string | undefined;
        children?: import("svelte").Snippet;
        [key: string]: any;
    }

    let {
        value = $bindable(),
        name,
        displayName = name,
        clearButton = true,
        selectClassName = "",
        error = undefined,
        children,
        ...rest
    }: Props = $props();

    const clearSelection = () => {
        value = null;
    };

    let hoverCss = $derived(
        value != null
            ? "group-hover:animate-drop-hover group-active:animate-drop-click"
            : "text-neutral-500",
    );
</script>

<InputAny {displayName} {name} {error} {...rest}>
    {#snippet label()}
        <label for={name} class="capitalize">{displayName}</label>
    {/snippet}
    {#snippet input()}
        <div class="flex gap-2">
            <select
                bind:value
                {name}
                id={name}
                class={twMerge(
                    "input w-full {error ? 'input-error' : ''}",
                    selectClassName,
                )}>
                {@render children?.()}
            </select>
            {#if clearButton}
                <button
                    onclick={() => clearSelection()}
                    disabled={value == null}
                    type="button"
                    class="group flex"
                    title="Clear Input">
                    <span
                        class={twMerge(
                            "inline-block w-5 group self-center",
                            hoverCss,
                        )}>
                        <IoIosRemoveCircle />
                    </span>
                </button>
            {/if}
        </div>
    {/snippet}
</InputAny>
