<script lang="ts">
  //@ts-ignore
  import IoIosRemoveCircle from "svelte-icons/io/IoIosRemoveCircle.svelte";
  import { twMerge } from "tailwind-merge";

  export let value: any | null | undefined;
  export let isValueNull: boolean | undefined = undefined;

  $: hoverCss =
    !isValueNull && value != null
      ? "group-hover:animate-drop-hover group-active:animate-drop-click"
      : "text-neutral-500";

  export let clearSelection: (() => void) | undefined = undefined;
</script>

<button
  on:click={() => {
    if (clearSelection) {
      clearSelection();
    } else {
      value = null;
    }
  }}
  disabled={isValueNull}
  type="button"
  class="group flex"
  title="Clear Input"
>
  <span class={twMerge("inline-block w-5 group self-center", hoverCss)}>
    <IoIosRemoveCircle />
  </span>
</button>
