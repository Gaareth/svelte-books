<!-- <script lang="ts">
  import { page } from "$app/stores";
  import BookList from "$lib/BookList/ReadingList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  let listName = data.listName;
</script>

<svelte:head>
  <title>Books {data.listName} - Gareth</title>
</svelte:head>

{#if data.exists}
  <h1 class="text-center text-5xl my-4 mb-6">
    {#if $page.data.session?.user?.name == data.username || data.username == null}
      MY
    {:else}
      {data.username}'s
    {/if}
    {data.listName} LIST
  </h1>

  <BookNew {listName} books={data.books ?? []} />
  <BookList books={data.books ?? []} />
{:else}
  <h1 class="text-center text-5xl my-4 mb-6">This list does not exist</h1>
{/if} -->
