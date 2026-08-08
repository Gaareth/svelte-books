<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import { twMerge } from "tailwind-merge";

    interface Props {
        wrapperClass?: string | undefined;
        groupClass?: string | undefined;
        btnClass?: string | undefined;
        btnSelectedClass?: string | undefined;
        startClass?: string | undefined;
        endClass?: string | undefined;
        options: string[];
        defaultOption?: number | undefined;
        deselectable?: boolean;
        editable?: boolean;
        selectedOption?: Option | undefined | null;
        displayFn?: ((option: Option) => string) | undefined;
        error?: string | undefined;
        children?: import("svelte").Snippet<[any]>;
    }

    let {
        wrapperClass = undefined,
        groupClass = undefined,
        btnClass = undefined,
        btnSelectedClass = undefined,
        startClass = undefined,
        endClass = undefined,
        options,
        defaultOption = undefined,
        deselectable = false,
        editable = true,
        selectedOption = $bindable(),
        displayFn = undefined,
        error = undefined,
        children,
    }: Props = $props();

    $effect(() => {
        if (selectedOption === undefined && defaultOption != null) {
            selectedOption = options[defaultOption];
        }
    });

    type Option = (typeof options)[number];
    const dispatch = createEventDispatcher();
</script>

<div class={twMerge("flex flex-col", wrapperClass)}>
    <div class={twMerge("flex", groupClass)}>
        {#each options as option, i}
            <button
                type="button"
                disabled={(selectedOption == option && !deselectable) ||
                    !editable}
                class={twMerge(
                    "flex items-center gap-1",
                    btnClass,
                    i == 0 && startClass,
                    i == options.length - 1 && endClass,
                    selectedOption == option && btnSelectedClass,
                )}
                onclick={() => {
                    if (!editable) return;

                    if (selectedOption == option && deselectable) {
                        selectedOption = undefined;
                    } else {
                        selectedOption = option;
                        dispatch("select", option);
                    }
                }}>
                {#if children}{@render children({ option, i })}{:else}
                    {displayFn ? displayFn(option) : option}
                {/if}
            </button>
        {/each}
    </div>
    {#if error}
        <span class="label-text-alt text-error">{error}</span>
    {/if}
</div>

<!-- TODO: add inputselect when not enough space -->