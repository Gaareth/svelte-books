<script lang="ts">
  import { invalidate, invalidateAll } from "$app/navigation";
  import BookList from "$lib/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import type { Book } from "@prisma/client";

  export let data: { books: Book[] };
</script>

<h1 class="text-center text-5xl my-4 mb-6">To-Read LIST</h1>

<BookNew
  endpoint="/book/create"
  listName={"To read"}
/>
<BookList books={data.books} />
