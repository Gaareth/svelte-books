<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import InputAny from "./InputAny.svelte";

    import ClearButton from "$components/input/ClearButton.svelte";

    interface Props {
        value?: unknown | null;
        name: string;
        displayName?: string;
        error?: string | undefined;
        inputClass?: string;
        skipLabel?: boolean;
        min?: number | string | undefined;
        max?: number | string | undefined;
        clearButton?: boolean;
        buttonWrapperClass?: string;
        [key: string]: any;
    }

    let {
        value = $bindable(),
        name,
        displayName = name,
        error = undefined,
        inputClass = "",
        skipLabel = false,
        min = undefined,
        max = undefined,
        clearButton = false,
        buttonWrapperClass = "",
        ...rest
    }: Props = $props();



    const increment = () => {
        if (
            typeof value === "number" &&
            (max === undefined || value < parseInt(max as string))
        ) {
            value += 1;
        }
    };

    const decrement = () => {
        if (
            typeof value === "number" &&
            (min === undefined || value > parseInt(min as string))
        ) {
            value -= 1;
        }
    };
</script>

<InputAny {displayName} {name} {error} {...rest}>
    {#snippet label()}
        <label for={name} class={twMerge("capitalize", skipLabel && "hidden")}>
            {displayName}
        </label>
    {/snippet}
    {#snippet input()}
        <div class="flex gap-2">
            <div class={twMerge("flex", buttonWrapperClass)}>
                <button
                    onclick={decrement}
                    class={twMerge(
                        "input !px-2 border",
                        inputClass,
                        "rounded-e-none border-e-0",
                    )}
                    type="button">
                    -
                </button>
                <input
                    id={name}
                    {name}
                    type="number"
                    pattern="[0-9]*"
                    inputmode="numeric"
                    class={twMerge(
                        "w-full z-10",
                        error ? "input-error" : "",
                        "!rounded-s-none !rounded-e-none",
                        inputClass,
                    )}
                    {min}
                    {max}
                    {...rest}
                    bind:value />
                <button
                    onclick={increment}
                    class={twMerge(
                        "input !px-2 border",
                        inputClass,
                        "rounded-s-none border-s-0",
                    )}
                    type="button">
                    +
                </button>
            </div>
            {#if clearButton}
                <ClearButton bind:value />
            {/if}
        </div>
    {/snippet}
</InputAny>

<style>
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type="number"] {
        appearance: textfield;
        -moz-appearance: textfield;
    }
</style>
