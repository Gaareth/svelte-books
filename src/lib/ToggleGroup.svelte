<script lang="ts">
  import { twMerge } from "tailwind-merge";

  export let groupClass: string | undefined = undefined;
  export let btnClass: string | undefined = undefined;
  export let btnSelectedClass: string | undefined = undefined;

  export let options: string[];
  export let defaultOption: number = 0;

  export let selectedOption = options[defaultOption];
</script>

<div class={twMerge("flex", groupClass)}>
  {#each options as option}
    <button
      type="button"
      class={twMerge(
        "flex items-center gap-1",
        btnClass,
        selectedOption == option && btnSelectedClass
      )}
      on:click={() => (selectedOption = option)}
    >
      {option}
    </button>
  {/each}
</div>
