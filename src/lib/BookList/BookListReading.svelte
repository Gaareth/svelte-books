<script lang="ts">
  import { onMount } from "svelte";

  import toast from "svelte-french-toast";
  //@ts-ignore
  import IoMdDoneAll from "svelte-icons/io/IoMdDoneAll.svelte";

  import ReadingListItem from "./ReadingListItem.svelte";

  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { type ReadingListItemType } from "$appTypes";

  export let readingActivities: ReadingListItemType[];
  export let isAuthorizedToModify = false;

  const sentences = [
    "Add a book, mate!",
    "Books, my friend. Get some!",
    "Ain't no books here, add one!",
    "Hey, your shelf's empty. Add a book!",
    "Don't leave that shelf empty, pal. Add a book!",
    "Books are calling, boi. Add one!",
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
  {#each readingActivities as entry (entry.id)}
    <form
      action={`api/reading-activity/readNow`}
      method="POST"
      use:enhance={() => {
        return async ({ result, update }) => {
          console.log("result", result);

          //@ts-ignore
          if (result.success === true) {
            invalidateAll();
            toast.success(`Successfully added book to read`);
          } else {
            toast.error("Failed updating book :(");
          }
        };
      }}>
      <input type="hidden" name="readingActivityId" value={entry.id} />

      <ReadingListItem {entry} {isAuthorizedToModify}>
        <button
          class="group p-2 !border-0 done-button"
          title="done reading"
          type="submit"
          slot="delete"
          on:click={() => {}}>
          <span
            class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
            <IoMdDoneAll alt="check mark" />
          </span>
        </button>
      </ReadingListItem>
    </form>
  {/each}
</div>

<style lang="postcss">
  .done-button {
    @apply hover:bg-green-300 focus:relative bg-green-200 text-green-600
              dark:bg-green-600 dark:hover:bg-green-500
              dark:text-green-200;
  }
</style>
