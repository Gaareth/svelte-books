<script lang="ts">
  import type { ReadingActivityStatusType } from "$lib/constants/enums";
  import Book from "$lib/icons/book.svelte";
  import { displayReadingActivityStatus } from "$lib/utils";

  export let users: {
    username: string;
    readingActivityLists: { status: ReadingActivityStatusType }[];
    numBooks: number;
  }[];
</script>

{#each users as user}
  <div
    class="default-border flex flex-col lg:grid grid-cols-[1fr_auto_1fr] items-center p-3 gap-2">
    <a
      class="text-lg hover:underline justify-self-start"
      href="/{user.username}">
      {user.username}
    </a>

    <div class="flex gap-1 sm:gap-2 flex-wrap justify-center">
      {#each user.readingActivityLists as list}
        <a href="/{user.username}/lists/{list?.status}" class="hover:underline">
          {displayReadingActivityStatus(list.status)}
        </a>
        |
      {/each}
    </div>

    <span class="flex items-center gap-1 justify-self-end" title="total books">
      {user.numBooks}
      <span class="block w-4">
        <Book />
      </span>
    </span>
  </div>
{/each}
