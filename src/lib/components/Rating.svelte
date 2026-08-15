<script lang="ts">
    import StarIcon from "../icons/Star/StarIcon.svelte";
    import StarOutlineIcon from "../icons/Star/StarOutlineIcon.svelte";
    import { v4 as uuidv4 } from "uuid";


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

    const uuid = uuidv4();
</script>

<div class="flex flex-row flex-wrap">
    {#each Array(rating_max) as _, i (uuid + String(i))}
        {#if i + 1 <= (rating ?? 0)}
            <button
                class="icon"
                disabled={!editable}
                onclick={() => decreaseRating(i + 1)}
                type="button">
                <StarIcon class="w-8 h-8"/>
            </button>
        {:else}
            <button
                class="icon"
                disabled={!editable}
                onclick={() => increaseRating(i + 1)}
                type="button">
                <StarOutlineIcon class="w-8 h-8"/>
            </button>
        {/if}
    {/each}
</div>
