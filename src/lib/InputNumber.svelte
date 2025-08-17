<script lang="ts">
  import { twMerge } from "tailwind-merge";
  import ClearButton from "./ClearButton.svelte";

  export let value: unknown | null = null;
  export let name: string;
  export let displayName: string = name;
  export let error: string | undefined = undefined;
  export let inputClass: string = "";

  export let clearButton = false;
</script>

<label for={name} class="capitalize">{displayName}:</label>
<div class="flex flex-col mb-3 sm:mb-0">
  <div class="flex gap-2">
    <input
      id={name}
      {name}
      type="number"
      pattern="[0-9]*"
      inputmode="numeric"
      class={twMerge("input w-full", 'error ? "input-error" : ""}', inputClass)}
      bind:value />
    {#if clearButton}
      <ClearButton bind:value />
    {/if}
  </div>
  <label for={name} class="label">
    {#if error}
      <span class="label-text-alt text-error">{error}</span>
    {/if}
  </label>
</div>
