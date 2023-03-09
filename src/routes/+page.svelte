<script lang="ts">
  import { invalidate, invalidateAll } from "$app/navigation";
  import BookList from "$lib/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";

  export let data: any;
</script>

<h1 class="text-center text-5xl my-4 mb-6">LIST</h1>

<BookNew endpoint="/" listName={"Read"}/>
<BookList books={data.books} />