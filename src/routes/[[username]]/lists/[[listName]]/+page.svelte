<script lang="ts">
  import { page } from "$app/stores";
  import { READING_STATUS } from "$appTypes";
  import ReadingList from "$lib/BookList/ReadingList.svelte";
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

  <BookNew
    readingStatus={"to read"}
    readingActivities={data.readingActivity ?? []} />
  <ReadingList entries={data.readingActivity} />
{:else}
  <h1 class="text-center text-5xl my-4 mb-6">This list does not exist</h1>
{/if}
