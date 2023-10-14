<script lang="ts">
  import { Moon } from "svelte-loading-spinners";

  import type { Book } from "@prisma/client";
  import { toast } from "svelte-french-toast";
  let loading = false;
  let errorsBooks: Book[] = [];

  const reload_all = async () => {
    loading = true;
    const response = await fetch("/book/api/update_all", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });
    loading = false;

    const response_json = await response.json();
    const {success, booksUpdated } = response_json;
    errorsBooks = response_json.errorsBooks;
    
    if (success) {
      toast.success(`Successfully added ${booksUpdated} new entries`);
    } else if (booksUpdated == 0) {
      toast.error("Failed updating any book :(");
    } else {
      toast(
        `Updated ${booksUpdated} books and failed on ${errorsBooks.length}`,
        {
          icon: "⚠️",
        }
      );
    }
  };

  //TODO: toast
</script>

<h1>Settings</h1>

<div>
  <h2>Datasource</h2>
  <button on:click={reload_all} class="btn-generic flex items-center gap-2" disabled={loading}>
    {#if loading}
      <span> <Moon size="18" color="black" duration="1s" /> </span>
      loading..
      {:else}
      Reload all
    {/if}
  </button>
  <p>
    Updates all existing entries and tries to fetch new data for books without a
    connected datasource
  </p>
  {#if errorsBooks.length > 0}
    <div>
      {#each errorsBooks as book}
        <div>
          {book.name}
        </div>
      {/each}
    </div>
  {/if}
</div>
