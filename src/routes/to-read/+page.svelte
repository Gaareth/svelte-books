<script lang="ts">
  import BookList from "$lib/BookList/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import type { BookFullType } from "../../app";

  export let data: {
    books: BookFullType[];
    category_names: { name: string }[];
  };
</script>

<svelte:head>
  <title>Books to read - Gareth</title>
</svelte:head>

<h1 class="text-center text-5xl my-4 mb-6">To-Read LIST</h1>

<BookNew listName={"To read"} authors={data.books.map((b) => b.author)} />
<BookList
  category_names={data.category_names.map((c) => c.name)}
  books={data.books}
/>
