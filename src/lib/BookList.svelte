<script lang="ts">
  import type { Book, Prisma } from "@prisma/client";

  export let books: Book[];
</script>

{#each books as book}
  <div class="border-blue-400 border-2 my-3 p-1 flex gap-3">
    <a href="/book/{book.name}">{book.name}</a>
    <p>{book.author}</p>
  </div>
{/each}
