<script lang="ts">
  import { page } from "$app/stores";
  import BookList from "$lib/BookList/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import Statistics from "$lib/Statistics.svelte";
  import clsx from "clsx";
  import type { BookFullType } from "../app";
  export let data: { books: BookFullType[] };

  let chance = 20;
  let random = Math.floor(Math.random() * chance);
</script>

<svelte:head>
  <title>Books - Gareth</title>
</svelte:head>

<h1 class={clsx("text-center text-5xl my-4 mb-6 mt-8", random != 0 ? "header-elnath" : "header-cloister")}>
  My Book List
</h1>
{#if !$page.data.session}
  <div>
    <details
      class="open:ring-1 open:ring-black/5
  dark:open:ring-slate-600 p-6 rounded-md"
    >
      <summary class="text-xl"> Why? </summary>
      <div>
        <p class="mb-5">
          This website exists because, I wanted something to "store" the books I
          have read, (and potentially also the books I want to read). Why not
          use some of those popular apps? Idk, but this also gave me a reason
          too look into
          <a href="https://svelte.dev/" class="underline">Svelte</a>, and built
          a simple app with it. And.. there we go :)
        </p>
      </div>
    </details>
  </div>
{:else}
  <Statistics books={data.books} />
{/if}
<div class="my-5" />
<BookNew
  listName={"Read"}
  authors={data.books.map((b) => b.author)}
/>
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
</style>
