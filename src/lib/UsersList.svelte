<script lang="ts">
  import type { Prisma } from "@prisma/client";
  import Book from "./icons/book.svelte";

  export let users: {
    username: string;
    readingActivityLists: { status: string }[];
    numBooks: number;
  }[];
</script>

{#each users as user}
  <div
    class="default-border flex flex-col lg:flex-row gap-1 lg:items-center p-3 lg:justify-between">
    <a class="text-lg hover:underline" href="/{user.username}">
      {user.username}
    </a>

    <div class="flex gap-1 sm:gap-2 flex-wrap">
      {#each user.readingActivityLists as list}
        <a href="/{user.username}/lists/{list?.status}" class="hover:underline">
          {list?.status}
        </a>
        |
      {/each}
    </div>

    <span class="flex items-center lg:justify-end" title="total books">
      {user.numBooks}
      <span class="block w-4">
        <Book />
      </span>
    </span>
  </div>
{/each}
