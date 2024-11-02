<script lang="ts">
  import { page } from "$app/stores";
  import BookList from "$lib/BookList/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import Statistics from "$lib/Statistics.svelte";
  import clsx from "clsx";
  import type { BookFullType } from "../app";
  export let data: {
    books: BookFullType[];
    most_read_categories: [string, number][];
    all_category_names: { name: string }[];
  };

  let chance = 20;
  let random = Math.floor(Math.random() * chance);
</script>

<svelte:head>
  <title>Books - Gareth</title>
</svelte:head>

<div class="background-pattern" />
<div class="background-pattern-overlay" />

<h1
  class={clsx(
    "text-center text-5xl my-4 mb-6 mt-8 header-gradient",
    random != 0 ? "header-elnath" : "header-cloister"
  )}
>
  My Book List
</h1>

{#if $page.data.session}
  <Statistics books={data.books} most_read_categories={data.most_read_categories} />
{/if}

<div class="my-5" />

<BookNew listName={"Read"} authors={data.books.map((b) => b.author)} />
<BookList
  books={data.books}
  category_names={data.all_category_names.map((c) => c.name)}
/>

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
  }

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
