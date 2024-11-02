<script lang="ts">
  import { twMerge } from "tailwind-merge";

  export let current_tab = 0;
  export let tabs: string[];
</script>

<div class={$$restProps.class}>
  <div>
    <ul class="flex gap-1">
      {#each tabs as tabname, i}
        <button on:click={() => (current_tab = i)}>{tabname}</button>
      {/each}
    </ul>
  </div>
  <div class={twMerge(current_tab != 0 ? "hidden" : "")}>
    <slot name="tab0" />
  </div>
  <div class={twMerge(current_tab != 1 ? "hidden" : "")}>
    <slot name="tab1" />
  </div>
  <div class={twMerge(current_tab != 2 ? "hidden" : "")}>
    <slot name="tab2" />
  </div>
</div>
