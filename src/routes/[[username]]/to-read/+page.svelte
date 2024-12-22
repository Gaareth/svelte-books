<script lang="ts">
  import { page } from "$app/stores";
  import BookList from "$lib/BookList/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import type { PageData } from "../$types";
  import type { BookFullType } from "../../../app";

  export let data: PageData;
</script>

<svelte:head>
  <title>Books to read - Gareth</title>
</svelte:head>

<h1 class="text-center text-5xl my-4 mb-6">
  {#if $page.data.session?.user?.name == data.username || data.username == null}
    my
  {:else}
    {data.username}'s
  {/if}
  To-Read LIST
</h1>

<BookNew listName={"To read"} authors={data.books.map((b) => b.author)} />
<BookList books={data.books} />
