<script lang="ts">
  import { twMerge } from "tailwind-merge";

  export let value: unknown | null = null;

  export let name: string;
  export let displayName: string | undefined = name;
  // export let type: string = "text"
  export let error: string | undefined = undefined;
  export let inputClass = "";
</script>

<label for={name} class="capitalize">
  <slot name="label">{displayName}:</slot>
</label>
<div class="flex flex-col mb-3 sm:mb-0">
  <input
    id={name}
    {name}
    class={twMerge("input w-full", error ? "input-error" : "", inputClass)}
    {...$$restProps}
    bind:value />

  {#if error}
    <span class="label-text-alt text-error">{error}</span>
  {/if}
</div>
