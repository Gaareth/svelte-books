<script lang="ts">
  import Book from "$lib/icons/book.svelte";

  export let data;
  console.log(data.users);
</script>

<h1 class="text-5xl mt-4">Users ({data.users.length})</h1>

<p class="text-secondary">Users are shown here only if they enabled it</p>

<div class="mt-2 flex flex-col gap-1">
  {#each data.users as user}
    <div
      class="default-border flex flex-col lg:flex-row gap-1 lg:items-center p-3 lg:justify-between">
      <a class="text-lg hover:underline" href="/{user.username}">
        {user.username}
      </a>

      <div class="flex gap-1 sm:gap-2 flex-wrap">
        {#each user.readingActivityLists as list}
          <a
            href="/{user.username}/lists/{list?.status}"
            class="hover:underline">
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
</div>
