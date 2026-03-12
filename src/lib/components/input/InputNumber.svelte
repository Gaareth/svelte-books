<script lang="ts">
  import { twMerge } from "tailwind-merge";

  import ClearButton from "$components/input/ClearButton.svelte";
  import InputAny from "./InputAny.svelte";

  export let value: unknown | null = null;
  export let name: string;
  export let displayName: string = name;
  export let error: string | undefined = undefined;
  export let inputClass = "";

  export let clearButton = false;
</script>

<InputAny {displayName} {name} {error} {...$$restProps}>
  <label slot="label" for={name} class="capitalize">{displayName}</label>
  <div class="flex gap-2" slot="input">
    <input
      id={name}
      {name}
      type="number"
      pattern="[0-9]*"
      inputmode="numeric"
      class={twMerge("input w-full", error ? "input-error" : "", inputClass)}
      bind:value />
    {#if clearButton}
      <ClearButton bind:value />
    {/if}
  </div>
</InputAny>
