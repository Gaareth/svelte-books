<script lang="ts">
  import { twMerge } from "tailwind-merge";

  import ClearButton from "$components/input/ClearButton.svelte";
  import InputAny from "./InputAny.svelte";

  export let value: unknown | null = null;
  export let name: string;
  export let displayName: string = name;
  export let error: string | undefined = undefined;
  export let inputClass = "";
  export let skipLabel = false;
  export let min: number | string | undefined = undefined;
  export let max: number | string | undefined = undefined;

  export let clearButton = false;

  const increment = () => {
    if (
      typeof value === "number" &&
      (max === undefined || value < parseInt(max as string))
    ) {
      value += 1;
    }
  };

  const decrement = () => {
    if (
      typeof value === "number" &&
      (min === undefined || value > parseInt(min as string))
    ) {
      value -= 1;
    }
  };
</script>

<InputAny {displayName} {name} {error} {...$$restProps}>
  <label
    slot="label"
    for={name}
    class={twMerge("capitalize", skipLabel && "hidden")}>
    {displayName}
  </label>
  <div class="flex gap-2" slot="input">
    <div class={twMerge("inline-flex")}>
      <button
        on:click={decrement}
        class={twMerge(
          "input !px-2 border",
          inputClass,
          "rounded-e-none border-e-0"
        )}
        type="button">
        -
      </button>
      <input
        id={name}
        {name}
        type="number"
        pattern="[0-9]*"
        inputmode="numeric"
        class={twMerge(
          "w-full z-10",
          error ? "input-error" : "",
          "!rounded-s-none !rounded-e-none",
          inputClass
        )}
        {min}
        {max}
        {...$$restProps}
        bind:value />
      <button
        on:click={increment}
        class={twMerge(
          "input !px-2 border",
          inputClass,
          "rounded-s-none border-s-0"
        )}
        type="button">
        +
      </button>
    </div>
    {#if clearButton}
      <ClearButton bind:value />
    {/if}
  </div>
</InputAny>

<style>
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }
</style>
