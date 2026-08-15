<script lang="ts">
    import StarIcon from "../icons/Star/StarIcon.svelte";
    import StarOutlineIcon from "../icons/Star/StarOutlineIcon.svelte";

    interface Props {
        rating: number | undefined | null;
        rating_max: number;
        editable?: boolean;
    }

    let { rating = $bindable(), rating_max, editable = false }: Props = $props();

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
                onclick={() => decreaseRating(i + 1)}
                type="button">
                <StarIcon />
            </button>
        {:else}
            <button
                class="icon"
                disabled={!editable}
                onclick={() => increaseRating(i + 1)}
                type="button">
                <StarOutlineIcon />
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
