<script lang="ts">
  import { invalidate, invalidateAll } from "$app/navigation";
  import BookList from "$lib/BookList.svelte";
  import BookNew from "$lib/BookNew.svelte";
  import type { ActionData } from "./$types";

  export let data: any;

</script>

<h1 class="text-center text-5xl my-4">LIST</h1>


<BookNew endpoint="/" />
<BookList books={data.books} />