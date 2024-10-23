<script lang="ts">
  //@ts-ignore
  import IoIosArrowUp from "svelte-icons/io/IoIosArrowUp.svelte";
  //@ts-ignore
  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";
  //@ts-ignore
  import IoIosRemove from "svelte-icons/io/IoIosRemove.svelte";
  import clsx from "clsx";
  import { twMerge } from "tailwind-merge";

  export let name: string;
  export let value: number | string | undefined = undefined;
  export let last_value: typeof value | undefined = undefined;
</script>

<div
  class={twMerge(
    "border p-3 px-4 rounded-md dark:border-slate-700 flex flex-col dark:bg-slate-800 bg-white",
    $$restProps.class
  )}
>
  <p class="text-gray-500 dark:text-gray-400 text-base">{name}</p>
  <div class="flex gap-2 min-h-[50px] flex-grow">
    <slot name="value">
      <p
        class={clsx(
          "font-bold self-center",
          typeof value === "number" ? "text-5xl" : "text-4xl"
        )}
      >
        {value.toLocaleString("en-US")}
      </p>
    </slot>
    {#if last_value != undefined && value != undefined}
      <div class="flex flex-row">
        <div
          class={clsx(
            "w-10 h-10 self-center",
            value > last_value ? "text-green-500" : "text-red-500"
          )}
        >
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
