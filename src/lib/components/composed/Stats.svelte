<script lang="ts">
  import clsx from "clsx";
  import { createEventDispatcher } from "svelte";
  //@ts-ignore
  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";
  //@ts-ignore
  import IoIosArrowUp from "svelte-icons/io/IoIosArrowUp.svelte";
  //@ts-ignore
  import IoIosRemove from "svelte-icons/io/IoIosRemove.svelte";
  //@ts-ignore
  import IoIosStats from "svelte-icons/io/IoIosStats.svelte";

  import { twMerge } from "tailwind-merge";

  export let name: string | undefined = undefined;
  export let value: number | string | undefined = undefined;
  export let last_value: typeof value | undefined = undefined;
  export let showStatsButton = false;

  const dispatch = createEventDispatcher();
</script>

<div
  class={twMerge(
    "border p-3 px-4 rounded-md dark:border-slate-700 flex flex-col dark:bg-slate-800 bg-white",
    $$restProps.class
  )}>
  <slot name="name">
    <div class="flex justify-between">
      <p class="text-gray-500 dark:text-gray-400 text-base">
        {name}
      </p>
      <slot name="statsButton">
        {#if showStatsButton}
          <button
            class="border rounded p-1 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
            on:click={() => dispatch("statsClick")}>
            <span class="w-5 block"><IoIosStats /></span>
          </button>
        {/if}
      </slot>
    </div>
  </slot>

  <div class="flex gap-2 min-h-[50px] flex-grow">
    <slot name="value">
      <p
        class={clsx(
          "font-bold self-center",
          typeof value === "number" ? "text-5xl" : "text-4xl"
        )}>
        {(value ?? NaN).toLocaleString("en-US")}
      </p>
    </slot>
    {#if last_value != undefined && value != undefined}
      <div class="flex flex-row">
        <div
          class={clsx(
            "w-10 h-10 self-center",
            value > last_value ? "text-green-500" : "text-red-500"
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
