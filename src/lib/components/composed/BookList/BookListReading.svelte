<script lang="ts">
    import { onMount } from "svelte";

    import DonePopup from "./Actions/DonePopup.svelte";
    import ReadingListItem from "./ReadingListItem.svelte";

    import { type ReadingListItemType } from "$appTypes";
        import { sortReadingActivity } from "$src/lib/utils/readingActivityUtils";

    interface Props {
        readingActivities: ReadingListItemType[];
        isAuthorizedToModify?: boolean;
    }

    let { readingActivities, isAuthorizedToModify = false }: Props = $props();
    let readingActivitiesSorted = $derived([...readingActivities].sort((a, b) => {
        return sortReadingActivity(a, b);
    }));

    const sentences = [
        "Add a book, mate!",
        "Books, my friend. Get some!",
        "Ain't no books here, add one!",
        "Hey, your shelf's empty. Add a book!",
        "Don't leave that shelf empty, pal. Add a book!",
        "Books are calling, friend. Add one!",
        "C'mon, your next read's waiting!",
        "Get some books, friend. It’s time!",
        "Hey, your library’s looking lonely. Add a book!",
        "Come on, start reading!",
    ];
    let randomSentence = $state("");
    onMount(() => {
        randomSentence =
            sentences[Math.floor(Math.random() * sentences.length)];
    });

    let popupEntry: ReadingListItemType | undefined = $state(undefined);
    let popupOpen = $state(false);
</script>

<div class="flex justify-between mt-8 mb-2 sm:flex-row flex-col">
    <h2 class="flex items-end text-2xl -mb-1">
        Currently Reading ({readingActivities.length})
    </h2>
</div>

{#if readingActivities.length < 1 && isAuthorizedToModify}
    <p class="text-center text-4xl rotate-90">:(</p>
    <p class="text-center text-gray-600 dark:text-slate-300 min-h-8">
        {randomSentence}
    </p>
{:else if readingActivities.length < 1}
    <p class="text-center text-gray-600 dark:text-slate-300 min-h-8">
        No public active reading activities.
    </p>
{/if}

<div class="dark:bg-slate-800 bg-white">
    {#each readingActivitiesSorted as entry (entry.id)}
        <ReadingListItem
            {entry}
            {isAuthorizedToModify}
            onDone={() => {
                popupEntry = entry;
                popupOpen = true;
            }} />
    {/each}
</div>

{#if popupEntry}
    <DonePopup id="done-popup" entry={popupEntry} bind:openModal={popupOpen} />
{/if}
