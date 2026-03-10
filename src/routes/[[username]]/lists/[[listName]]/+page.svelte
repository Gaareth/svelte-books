<script lang="ts">
  import type { PageData } from "./$types";

  import { page } from "$app/stores";
  import ReadingList from "$components/composed/BookList/ReadingList.svelte";
  import BookNew from "$components/composed/BookNew.svelte";
  import { capitalize } from "$utils/utils";
  import {
    READING_STATUS_VALUES,
    type ReadingActivityStatusType,
  } from "$lib/constants/enums";

  export let data: PageData;

  $: listDisplayName = READING_STATUS_VALUES.includes(
    data.listName as ReadingActivityStatusType
  )
    ? capitalize(data.listName as ReadingActivityStatusType)
    : data.listName;
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
    <span class="italic text-5xl">{listDisplayName}</span>
    LIST
  </h1>

  {#if data.isAuthorizedToModify}
    <BookNew
      readingStatus={"to read"}
      readingActivities={data.readingActivity ?? []} />
  {/if}

  <ReadingList
    entries={data.readingActivity}
    isAuthorizedToModify={data.isAuthorizedToModify} />
{:else}
  <h1 class="text-center text-5xl my-4 mb-6">This list does not exist</h1>
{/if}
