<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import { twMerge } from "tailwind-merge";

  export let wrapperClass: string | undefined = undefined;
  export let groupClass: string | undefined = undefined;
  export let btnClass: string | undefined = undefined;
  export let btnSelectedClass: string | undefined = undefined;
  export let startClass: string | undefined = undefined;
  export let endClass: string | undefined = undefined;

  export let options: string[];
  export let defaultOption: number | undefined = undefined;
  export let deselectable = false;
  export let editable = true;

  export let selectedOption: Option | undefined | null =
    defaultOption != null ? options[defaultOption] : undefined;

  export let displayFn: ((option: Option) => string) | undefined = undefined;

  export let error: string | undefined = undefined;

  type Option = (typeof options)[number];
  const dispatch = createEventDispatcher();
</script>

<div class={twMerge("flex flex-col", wrapperClass)}>
  <div class={twMerge("flex", groupClass)}>
    {#each options as option, i}
      <button
        type="button"
        disabled={(selectedOption == option && !deselectable) || !editable}
        class={twMerge(
          "flex items-center gap-1",
          btnClass,
          i == 0 && startClass,
          i == options.length - 1 && endClass,
          selectedOption == option && btnSelectedClass
        )}
        on:click={() => {
          if (!editable) return;

          if (selectedOption == option && deselectable) {
            selectedOption = undefined;
          } else {
            selectedOption = option;
            dispatch("select", option);
          }
        }}>
        <slot {option} {i}>{displayFn ? displayFn(option) : option}</slot>
      </button>
    {/each}
  </div>
  {#if error}
    <span class="label-text-alt text-error">{error}</span>
  {/if}
</div>
