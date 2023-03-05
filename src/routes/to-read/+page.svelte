<script lang="ts">
  import BookList from "$lib/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import type { Book } from "@prisma/client";

  export let data: {books: Book[]}
  let books: Book[] = data.books;
</script>

<h1 class="text-center text-5xl my-4">To-Read LIST</h1>

<BookNew endpoint="/to-read" />
<BookList books={books} />
