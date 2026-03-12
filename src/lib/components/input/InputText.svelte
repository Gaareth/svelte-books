<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import InputAll from "./InputAll.svelte";

  export let value: unknown | undefined = undefined;
  export let name: string;
  export let displayName: string = name;
  // export let type: string = "text"
  export let error: string | undefined;
  export let hasIcon = false;
</script>

<!-- <label for={name} class="capitalize">{displayName}:</label>
<div class="flex flex-col mb-3 sm:mb-0">
  <input
    id={name}
    {name}
    type="text"
    class="input w-full {error ? 'input-error' : ''}"
    bind:value />
  <label for={name} class="label">
    {#if error}
      <span class="label-text-alt text-error">{error}</span>
    {/if}
  </label>
</div> -->

<InputAll {displayName} {name} {error} {...$$restProps} bind:value>
  <label slot="label" for={name} class="capitalize">
    {#if hasIcon}
      <div class="icon-wrapper">
        <slot name="icon" />
        {displayName}
      </div>
    {:else}
      {displayName}
    {/if}
  </label>
</InputAll>
