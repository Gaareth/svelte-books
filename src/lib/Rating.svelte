<script lang="ts">
  //@ts-ignore
  import IoIosStarOutline from "svelte-icons/io/IoIosStarOutline.svelte";
  //@ts-ignore
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";

  export let rating: number | undefined;
  export let rating_max: number;
  export let editable = false;

  const increaseRating = (i: number) => {
    if (!editable) {
      return;
    }
    rating = i;
  };

  const decreaseRating = (i: number) => {
    if (!editable) {
      return;
    }

    if (i == rating) {
      rating -= 1;
    } else {
      rating = i;
    }
  };
</script>

<div class="flex flex-row flex-wrap">
  {#each Array(rating_max) as _, i}
    {#if i + 1 <= (rating ?? 0)}
      <button
        class="icon"
        disabled={!editable}
        on:click={() => decreaseRating(i + 1)}
        type="button"
      >
        <IoIosStar />
      </button>
    {:else}
      <button
        class="icon"
        disabled={!editable}
        on:click={() => increaseRating(i + 1)}
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
