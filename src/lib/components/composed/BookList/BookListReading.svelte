<script lang="ts">
  import { onMount } from "svelte";

  import toast from "svelte-french-toast";
  //@ts-ignore
  import IoMdDoneAll from "svelte-icons/io/IoMdDoneAll.svelte";

  import ReadingListItem from "./ReadingListItem.svelte";

  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { type ReadingListItemType } from "$appTypes";
  import { sortReadingActivity } from "$lib/utils/utils";
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
  import DoneReadingAction from "./Actions/DoneReadingAction.svelte";
  import BookActions from "./Actions/BookActions.svelte";

  export let readingActivities: ReadingListItemType[];
  export let isAuthorizedToModify = false;
  $: readingActivitiesSorted = [...readingActivities].sort((a, b) => {
    return sortReadingActivity(a, b);
  });

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
  let randomSentence = "";
  onMount(() => {
    randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
  });
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
{/if}

<div class="dark:bg-slate-800 bg-white">
  {#each readingActivitiesSorted as entry (entry.id)}
    <ReadingListItem {entry} {isAuthorizedToModify} />
  {/each}
</div>
