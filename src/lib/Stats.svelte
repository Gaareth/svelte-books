<script lang="ts">
  import IoIosArrowUp from "svelte-icons/io/IoIosArrowUp.svelte";

  import IoIosArrowDown from "svelte-icons/io/IoIosArrowDown.svelte";
  import IoIosRemove from "svelte-icons/io/IoIosRemove.svelte";
  import clsx from "clsx";

  export let name: string;
  export let value: number | string;
  export let last_value: typeof value | undefined = undefined;
</script>

<div class="border p-3 px-4 rounded-md dark:border-slate-700">
  <p class="text-gray-500 dark:text-gray-400 text-base">{name}</p>
  <div class="flex gap-2 min-h-[50px]">
    <p class={clsx("font-bold self-center", typeof value === "number" ? "text-5xl" : "text-4xl")}>{value}</p>
    {#if last_value != undefined}
      <div class="flex flex-col justify-center content-around">
        <div
          class={clsx(
            "w-10 h-10",
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
        <p class="flex justify-center -mt-4">
          {#if value > last_value}
            +{value - last_value}
          {:else if value < last_value}
            -{last_value - value}
          {:else}
            +/- 0
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>
