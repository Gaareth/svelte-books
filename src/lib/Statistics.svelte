<script lang="ts">
  import type { BookFullType } from "../app";
  import Stats from "./Stats.svelte";

  export let books: BookFullType[];
  let now = new Date();

  let books_read_per_month = (month: number): BookFullType[] => {
    return books.filter(
      (b) => b.yearRead == now.getFullYear() && (b.monthRead ?? -1) == month // -1 if monthRead is null, so this will be false
    );
  };

  let books_this_month: BookFullType[] = books_read_per_month(
    now.getMonth() + 1
  );

  let books_last_month: BookFullType[] = books_read_per_month(
    now.getMonth()
  );

  let most_read_author = () => {
    let authors = books.map((b) => b.author);
    let author_occur: { [key: string]: number } = {};
    authors.forEach((a: string) =>
      author_occur[a] ? ++author_occur[a] : (author_occur[a] = 1)
    );

    var sortedArray = Object.entries(author_occur).sort(
      ([, a], [, b]) => a - b
    );
    return sortedArray[sortedArray.length - 1][0];
  };
</script>

<div class="flex gap-3 flex-wrap">
  <Stats name="total books read" value={books.length} />
  <Stats name="books read this month" value={books_this_month.length} last_value={books_last_month.length}/>
  {#if books.length > 0}
     <Stats name="most read author" value={most_read_author()} />
  {/if}
</div>
