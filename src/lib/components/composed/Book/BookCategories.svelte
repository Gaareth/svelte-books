<script lang="ts">
  import DoubleArrowRounded from "$src/lib/icons/DoubleArrowRounded.svelte";
  import Pill from "$components/Pill.svelte";

  export let categories: { name: string }[] | undefined = [];
</script>

{#if (categories ?? []).length > 0}
  <div class="flex flex-wrap gap-1">
    {#each categories ?? [] as category}
      <Pill className="dark:bg-slate-600 icon-wrapper !gap-0">
        {#each category.name.split("/") as part}
          {part}
          {#if part != category.name.split("/").slice(-1)[0]}
            <span class="w-5 me-0.5">
              <DoubleArrowRounded />
            </span>
          {/if}
        {:else}
          <!-- empty list -->
        {/each}
      </Pill>
    {/each}
  </div>
{/if}
