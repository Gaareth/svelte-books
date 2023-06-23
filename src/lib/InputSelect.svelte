<script lang="ts">
  import IoIosRemoveCircle from "svelte-icons/io/IoIosRemoveCircle.svelte";

  export let value: Object | null;
  export let name: string;
  export let displayName: string = name;

  // export let type: string = "text"
  export let error: string | undefined;

  const clearSelection = () => {
    value = null;
  };

  $: hoverCss = value != null ? "group-hover:animate-drop-hover group-active:animate-drop-click" : "text-neutral-500";
</script>

<label for="name">{displayName}:</label>
<div class="flex flex-col mb-3 sm:mb-0">
  <div class="flex gap-2">
    <select
      bind:value
      {name}
      id={name}
      class="input w-full {!!error ? 'input-error' : ''}"
    >
      <slot />
    </select>
    <button on:click={() => clearSelection()} disabled={value === null}
      type="button" class="group" title="Clear Input">
      <div
        class="icon group {hoverCss}"
      >
        <IoIosRemoveCircle />
      </div>
    </button>
  </div>
  <label for="name" class="label">
    {#if !!error}
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
