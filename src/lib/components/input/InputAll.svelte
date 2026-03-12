<script lang="ts">
  import { twMerge } from "tailwind-merge";
  import InputAny from "./InputAny.svelte";

  export let value: unknown | null = null;

  export let name: string;
  export let displayName: string | undefined = name;
  // export let type: string = "text"
  export let error: string | undefined | null = undefined;
  export let inputClass = "";
</script>

<InputAny {displayName} {name} {error} {...$$restProps}>
  <slot name="label" slot="label">{displayName}</slot>
  <input
    slot="input"
    id={name}
    {name}
    class={twMerge("input w-full", error ? "input-error" : "", inputClass)}
    {...$$restProps}
    bind:value />
</InputAny>
