<script lang="ts">
  //@ts-ignore
  import IoIosRemoveCircle from "svelte-icons/io/IoIosRemoveCircle.svelte";
  import { twMerge } from "tailwind-merge";

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

<label for={name}>{displayName}:</label>
<div class="flex flex-col mb-3 sm:mb-0">
  <div class="flex gap-2">
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
        <span class={twMerge("inline-block icon group self-center", hoverCss)}>
          <IoIosRemoveCircle />
        </span>
      </button>
    {/if}
  </div>
  <label for={name} class="label">
    {#if error}
      <span class="label-text-alt text-error">{error}</span>
    {/if}
  </label>
</div>

<style>
  .icon {
    width: 20px;
    height: 20px;
  }
</style>
