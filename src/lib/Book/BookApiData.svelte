<script lang="ts">
  import type { Prisma } from "@prisma/client";

  type BookApiData = Prisma.BookApiDataGetPayload<{
    include: { categories: true };
  }>;

  let datasource = "Google Books API";
  export let data: BookApiData | null;
</script>

<details class="my-2">
  <summary class="text-lg">API Data (Datasource: {datasource})</summary>
  {#if data}
    <div class="attribute-stats">
      <p>Subtitle: {data.subtitle}</p>
      <p>Pages: {data.pageCount}</p>
      <p>Categories: {data.categories.map((c) => c.name).join(" | ")}</p>
      <p>Publisher: {data.publisher} ({data.publishedDate})</p>
      <div class="flex items-center gap-2">
        <p>Language:</p>
        <span
          ><img
            class="w-6"
            src={`/language-icons/icons/${data.language}.svg`}
            alt={`${data.language} language icon`}
          /></span
        >
      </div>
      <p>ISBN13: {data.isbn_13}</p>
    </div>
  {:else}
    <p>No Data</p>
  {/if}
</details>
