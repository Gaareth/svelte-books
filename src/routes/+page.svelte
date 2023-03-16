<script lang="ts">
  import { invalidate, invalidateAll } from "$app/navigation";
  import BookList from "$lib/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";

  export let data: any;

  let chance = 20;
  let random = Math.floor(Math.random() * chance);
</script>

<h1 class="text-center text-5xl my-4 mb-6 mt-8" id="header">My Book List</h1>
<div>
  <details class="open:ring-1 open:ring-black/5 
  dark:open:ring-slate-600 p-6 rounded-md">
    <summary class="text-xl"> Why? </summary>
    <div>
      <p class="mb-5">
        This website exists because, I wanted something to "store" the
        books I have read, (and potentially also the books I want to read). Why not use some of
        those popular apps? Idk, but this also gave me a reason too look into
        <a href="https://svelte.dev/" class="underline">Svelte</a>, and built a
        simple app with it. And.. there we go :)
      </p>
    </div>
  </details>
</div>
<BookNew endpoint="/" listName={"Read"} />
<BookList books={data.books} />

{#if random != 0}
  <style>
    #header {
      font-family: "Elnath";
    }
  </style>
{:else}
  <!-- 1/{chance}% to get this font -->
  <style>
    #header {
      font-family: "Cloister";
      font-size: 4.5rem;
      margin-bottom: 3rem;
    }
  </style>
{/if}
