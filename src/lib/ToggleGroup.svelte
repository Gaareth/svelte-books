<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { twMerge } from "tailwind-merge";

  export let groupClass: string | undefined = undefined;
  export let btnClass: string | undefined = undefined;
  export let btnSelectedClass: string | undefined = undefined;
  export let startClass: string | undefined = undefined;
  export let endClass: string | undefined = undefined;

  export let options: string[];
  export let defaultOption: number | undefined = undefined;
  export let unToggleable: boolean = false;

  export let selectedOption: Option | undefined | null =
    defaultOption != null ? options[defaultOption] : undefined;

  type Option = (typeof options)[number];
  const dispatch = createEventDispatcher();
</script>

<div class={twMerge("flex", groupClass)}>
  {#each options as option, i}
    <button
      type="button"
      class={twMerge(
        "flex items-center gap-1",
        btnClass,
        i == 0 && startClass,
        i == options.length - 1 && endClass,
        selectedOption == option && btnSelectedClass
      )}
      on:click={() => {
        if (selectedOption == option && unToggleable) {
          selectedOption = undefined;
        } else {
          selectedOption = option;
          dispatch("select", option);
        }
      }}
    >
      {option}
    </button>
  {/each}
</div>
