<script lang="ts">
  import { page } from "$app/stores";
  import BookList from "$lib/BookList/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import Statistics from "$lib/Statistics.svelte";
  import clsx from "clsx";
  import type { BookFullType } from "../app";
  export let data: {
    books: BookFullType[];
    most_read_category: [string, number];
  };
  let most_read_category = data.most_read_category;

  let chance = 20;
  let random = Math.floor(Math.random() * chance);
</script>

<svelte:head>
  <title>Books - Gareth</title>
</svelte:head>

<h1
  class={clsx(
    "text-center text-5xl my-4 mb-6 mt-8 header-gradient",
    random != 0 ? "header-elnath" : "header-cloister"
  )}
>
  My Book List
</h1>
{#if $page.data.session}
  <Statistics books={data.books} {most_read_category} />
{/if}
<div class="my-5" />
<BookNew listName={"Read"} authors={data.books.map((b) => b.author)} />
<BookList books={data.books} />

<style>
  .header-elnath {
    font-family: "Elnath";
  }
  .header-cloister {
    font-family: "Cloister";
    font-size: 4.5rem;
    margin-bottom: 3rem;
  }

  .header-gradient {
    /* background: #0968e5;
    background: linear-gradient(to right, #0968e5 0%, #820da0 70%);
    background: #62cdf4;
    background: linear-gradient(to right, #62cdf4 0%, #2c67f2 100%); */

    /* background: hsla(283, 88%, 48%, 1);

    background: linear-gradient(
      90deg,
      hsla(283, 88%, 48%, 1) 0%,
      hsla(234, 63%, 49%, 1) 100%
    ); */

    background: #f27f6d;
    background: linear-gradient(to right, #f27f6d 0%, #9335e6 98%);
    animation: scroll_background 10s ease infinite;
    background-size: 200% 100%;

    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @keyframes scroll_background {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style>
