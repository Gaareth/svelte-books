<script lang="ts">
  //@ts-ignore
  import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";

  import { createEventDispatcher } from "svelte";
  import type { ReadingListItemType } from "$appTypes";
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
  import NowReadingAction from "./NowReadingAction.svelte";
  import DoneReadingAction from "./DoneReadingAction.svelte";
  import DeleteAction from "./DeleteAction.svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import toast from "svelte-french-toast";

  export let isAuthorizedToModify: boolean = false;
  export let allow_deletion: boolean | undefined = false;
  export let entry: ReadingListItemType;
  $: book_url = encodeURIComponent(entry.book.name);
  $: statusType = entry.status.status;

  const dispatch = createEventDispatcher();
</script>

{#if isAuthorizedToModify}
  <div class="flex justify-end ms-2 sm:ms-0 sm:flex-1">
    <form
      action={`/api/reading-activity/transform`}
      method="POST"
      use:enhance={() => {
        return async ({ result, update }) => {
          //@ts-ignore
          if (result.success === true) {
            await invalidateAll();
            toast.success(`Successfully updated book!`);
          } else {
            toast.error("Failed updating book :(");
          }
        };
      }}>
      <input type="hidden" name="readingActivityId" value={entry.id} />
      <!-- is already included in the buttons -->
      <!-- <input
        type="hidden"
        name="targetStatus"
        value={READING_ACTIVITY_TYPES.FINISHED} /> -->

      <span
        class="inline-flex flex-row divide-x overflow-hidden rounded-md border bg-white shadow-sm
            dark:bg-slate-600 dark:border-slate-700">
        <a
          class="group inline-block p-2 hover:bg-gray-50 focus:relative
              dark:hover:bg-slate-500"
          title="Edit book"
          href="/book/{book_url}/?edit=true">
          <span
            class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
            <IoMdSettings />
          </span>
        </a>

        {#if statusType == READING_ACTIVITY_TYPES.ACQUIRED}
          <!-- content here -->
        {:else if statusType == READING_ACTIVITY_TYPES.TO_READ}
          <NowReadingAction />
        {:else if statusType == READING_ACTIVITY_TYPES.READING}
          <DoneReadingAction />
        {:else if allow_deletion}
          <DeleteAction on:delete={() => dispatch("delete", { entry })} />
        {/if}
      </span>
    </form>
  </div>
{:else}
  <div class="hidden sm:flex justify-end ms-2">
    <a class="underline-hover" href="/{entry.account.username}/book/{book_url}">
      View
    </a>
  </div>
{/if}

<style lang="postcss">
  .icon {
    width: 20px;
    height: 20px;
  }
  .icon-edit {
    width: 20px;
    height: 20px;
  }
</style>
