<script lang="ts">
  import clsx from "clsx";

  import type { PageData } from "./$types";
  import { page } from "$app/stores";
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";

  import BookListReading from "$components/composed/BookList/BookListReading.svelte";
  import ReadingList from "$components/composed/BookList/ReadingList.svelte";
  import BookNew from "$components/composed/BookNew.svelte";
  import Statistics from "$components/composed/Statistics.svelte";
  import { getActiveActivies } from "$lib/utils/utils";

  export let data: PageData;

  let chance = 20;
  let random = Math.floor(Math.random() * chance);

  $: activeActivies = getActiveActivies(data.readingActivity);
  $: currentlyReadingActivities = activeActivies.filter(
    (e) =>
      e.status.status === READING_ACTIVITY_TYPES.READING ||
      e.status.status === READING_ACTIVITY_TYPES.PAUSED
  );

  $: ownerName =
    $page.data.session?.user?.name == data.username || data.username == null
      ? "My"
      : `${data.username}'s`;
</script>

<svelte:head>
  <title>{ownerName} Books</title>
</svelte:head>

<div class="background-pattern" />
<div class="background-pattern-overlay" />

<h1
  class={clsx(
    "text-center text-5xl my-4 mb-6 mt-8 header-gradient",
    random != 0 ? "header-elnath" : "header-cloister"
  )}>
  {ownerName}
  Book List
</h1>

<Statistics readingActivities={data.readingActivity} />

<div class="my-5" />

{#if data.isCurrentlyReadingPublic}
  <div class="mb-10">
    <BookListReading
      isAuthorizedToModify={data.isAuthorizedToModify}
      readingActivities={currentlyReadingActivities} />
  </div>
{/if}

{#if data.isAuthorizedToModify}
  <BookNew
    readingStatus={"FINISHED"}
    readingActivities={data.readingActivity ?? []} />
{/if}

<ReadingList
  isAuthorizedToModify={data.isAuthorizedToModify}
  entries={data.readingActivity.filter(
    (e) =>
      e.status.status === READING_ACTIVITY_TYPES.FINISHED ||
      e.status.status === READING_ACTIVITY_TYPES.DID_NOT_FINISH
  )} />

<style>
  @keyframes pan {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 100% 0%;
    }
  }

  @media (max-width: 650px) {
    .background-pattern {
      height: 0 !important;
    }
  }

  :is(.dark .background-pattern) {
    background-image: url("/book-pattern.svg");
    opacity: 0.05;
  }

  .background-pattern {
    background-image: url("/book-patternW.svg");
    background-size: 10%;
    position: absolute;

    top: 0px;
    left: 0px;
    z-index: -2;
    height: 100%;
    width: 100%;

    animation: pan 180s linear infinite;
    will-change: background-position;
    opacity: 0.15;
    /* background-color: rgb(215 147 23); */
  }

  :is(.dark .background-pattern-overlay) {
    background: radial-gradient(circle, transparent 70%, rgb(30, 41, 59));
  }

  .background-pattern-overlay {
    background: radial-gradient(circle, transparent 70%, white);
    position: absolute;

    width: 100%;
    height: 100%;
    opacity: 0.9;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    /* bottom: 0; */
    /* margin: auto; */

    backdrop-filter: blur(2px);
  }

  .header-elnath {
    font-family: "Elnath";
  }
  .header-cloister {
    font-family: "Cloister";
    font-size: 4.5rem;
    margin-bottom: 3rem;
  }
</style>
