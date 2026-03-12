<script lang="ts">
  //@ts-ignore
  import IoIosRemoveCircle from "svelte-icons/io/IoIosRemoveCircle.svelte";
  import { twMerge } from "tailwind-merge";
  import InputAny from "./InputAny.svelte";

  export let value: unknown | null;
  $: {
    value = value === undefined ? null : value;
  }

  export let name: string;
  export let displayName: string = name;
  export let clearButton = true;

  export let selectClassName = "";

  // export let type: string = "text"
  export let error: string | undefined = undefined;

  const clearSelection = () => {
    value = null;
  };

  $: hoverCss =
    value != null
      ? "group-hover:animate-drop-hover group-active:animate-drop-click"
      : "text-neutral-500";
</script>

<InputAny {displayName} {name} {error} {...$$restProps}>
  <label slot="label" for={name} class="capitalize">{displayName}</label>
  <div class="flex gap-2" slot="input">
    <select
      bind:value
      {name}
      id={name}
      class={twMerge(
        "input w-full {error ? 'input-error' : ''}",
        selectClassName
      )}>
      <slot />
    </select>
    {#if clearButton}
      <button
        on:click={() => clearSelection()}
        disabled={value == null}
        type="button"
        class="group flex"
        title="Clear Input">
        <span class={twMerge("inline-block w-5 group self-center", hoverCss)}>
          <IoIosRemoveCircle />
        </span>
      </button>
    {/if}
  </div>
</InputAny>
