<script lang="ts">
  import { createEventDispatcher } from "svelte";

  //@ts-ignore
  import ArrowDown from "svelte-icons/io/IoMdArrowDropdown.svelte";
  //@ts-ignore
  import ArrowUp from "svelte-icons/io/IoMdArrowDropup.svelte";

  export let reversed = false;
  const dispatch = createEventDispatcher();
</script>

<button
  class="btn-generic-icon"
  on:click={() => {
    reversed = !reversed;
    dispatch("click");
  }}
  title="Reverse sort order"
>
  <span class="block w-6 h-6">
    {#if reversed}
      <ArrowDown />
    {:else}
      <ArrowUp />
    {/if}
  </span>
</button>
