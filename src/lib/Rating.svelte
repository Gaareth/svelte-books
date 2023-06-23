<script lang="ts">
  import IoIosStarOutline from "svelte-icons/io/IoIosStarOutline.svelte";
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";

  export let rating: number;
  export let rating_max: number;

  const increaseRating = (i: number) => {
    rating = i;
  };

  const decreaseRating = (i: number) => {
    if (i == rating) {
      rating -= 1;
    } else {
      rating = i;
    }
  };
</script>

<div class="flex flex-row flex-wrap">
  {#each Array(rating_max) as _, i}
    {#if i + 1 <= rating}
      <button
        class="icon"
        on:click={(e) => decreaseRating(i + 1)}
        type="button"
      >
        <IoIosStar />
      </button>
    {:else}
      <button
        class="icon"
        on:click={(e) => increaseRating(i + 1)}
        type="button"
      >
        <IoIosStarOutline />
      </button>
    {/if}
  {/each}
</div>

<style>
  .icon {
    width: 32px;
    height: 32px;
  }
</style>
