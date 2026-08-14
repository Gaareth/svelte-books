<script lang="ts">
    import clsx from "clsx";
    //@ts-ignore
    import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";
    //@ts-ignore
    import IoIosArrowUp from "svelte-icons/io/IoIosArrowUp.svelte";
    //@ts-ignore
    import IoIosRemove from "svelte-icons/io/IoIosRemove.svelte";
    //@ts-ignore
    import IoIosStats from "svelte-icons/io/IoIosStats.svelte";
    import { twMerge } from "tailwind-merge";

    interface Props {
        titleString?: string | undefined;
        value?: number | string | undefined;
        last_value?: typeof value | undefined;
        showStatsButton?: boolean;
        titleSnippet?: import("svelte").Snippet;
        statsButton?: import("svelte").Snippet;
        valueSnippet?: import("svelte").Snippet;
        onShowStats?: () => void;
        [key: string]: any;
    }

    let {
        titleString = undefined,
        value = undefined,
        last_value = undefined,
        showStatsButton = false,
        titleSnippet,
        statsButton,
        valueSnippet,
        onShowStats,
        ...rest
    }: Props = $props();
</script>

<div
    class={twMerge(
        "border p-3 px-4 rounded-md dark:border-slate-700 flex flex-col dark:bg-slate-800 bg-white",
        rest.class,
    )}>
    {#if titleSnippet}
        {@render titleSnippet()}
    {:else}
        <div class="flex justify-between">
            <p class="text-gray-500 dark:text-gray-400 text-base">
                {titleString}
            </p>
            {#if statsButton}
                {@render statsButton()}
            {:else if showStatsButton}
                <button
                    class="border rounded p-1 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
                    onclick={onShowStats}>
                    <span class="w-5 block"><IoIosStats /></span>
                </button>
            {/if}
        </div>
    {/if}

    <div class="flex gap-2 min-h-[50px] flex-grow">
        {#if valueSnippet}
            {@render valueSnippet()}
        {:else}
            <p
                class={clsx(
                    "font-bold self-center",
                    typeof value === "number" ? "text-5xl" : "text-4xl",
                )}>
                {(value ?? NaN).toLocaleString("en-US")}
            </p>
        {/if}
        {#if last_value != undefined && value != undefined}
            <div class="flex flex-row">
                <div
                    class={clsx(
                        "w-10 h-10 self-center",
                        value > last_value ? "text-green-500" : "text-red-500",
                    )}>
                    {#if value > last_value}
                        <IoIosArrowUp />
                    {:else if value < last_value}
                        <IoIosArrowDown />
                    {:else}
                        <IoIosRemove />
                    {/if}
                </div>
                {#if typeof value == "number" && typeof last_value == "number"}
                    <p class="self-center">
                        {#if value > last_value}
                            +{(value - last_value).toLocaleString("en-US")}
                        {:else if value < last_value}
                            -{(last_value - value).toLocaleString("en-US")}
                        {:else}
                            +/- 0
                        {/if}
                    </p>
                {/if}
            </div>
        {/if}
    </div>
</div>
