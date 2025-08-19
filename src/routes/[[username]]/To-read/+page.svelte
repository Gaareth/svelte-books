<script lang="ts">
  import { READING_STATUS } from "$appTypes";
  import ReadingList from "$lib/BookList/ReadingList.svelte";
  import BookList from "$lib/BookList/ReadingList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>Books To Read - {data.session?.user?.name}</title>
</svelte:head>

<h1 class="text-center text-5xl my-4 mb-6">
  {#if data.session?.user?.name == data.username || data.username == null}
    MY
  {:else}
    {data.username}'s
  {/if}
  To Read LIST
</h1>

<BookNew
  readingStatus={"to read"}
  readingActivities={data.readingActivity ?? []} />
<ReadingList
  entries={data.readingActivity.filter(
    (e) => e.status === READING_STATUS.TO_READ
  )} />
