<script lang="ts">
  import IoIosStarOutline from "svelte-icons/io/IoIosStarOutline.svelte";
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";

  export let rating: Number;
  export let rating_max: number;
</script>

<div class="flex flex-row flex-wrap">
  {#each Array(rating_max) as _, i}
    {#if (i+1) <= rating}
      <div class="icon">
        <IoIosStar />
      </div>
    {:else}
      <div class="icon">
        <IoIosStarOutline />
      </div>
    {/if}
  {/each}
</div>

<style>
  .icon {
    width: 32px;
    height: 32px;
  }
</style>
