<script lang="ts">
  import { twMerge } from "tailwind-merge";

  export let value: unknown | null = null;
  export let name: string;
  export let displayName: string = name;
  export let error: string | undefined = undefined;  
  export let inputClass: string = "";
</script>

<label for={name} class="capitalize">{displayName}:</label>
<div class="flex flex-col mb-3 sm:mb-0">
  <input id={name} {name} type="number" pattern="[0-9]*" inputmode="numeric"
  class={twMerge("input w-full", 'error ? "input-error" : ""}', inputClass)} bind:value />
  <label for={name} class="label">
    {#if error}
      <span class="label-text-alt text-error">{error}</span>
    {/if}
  </label>
</div>
