<script lang="ts">
  import IoIosSearch from "svelte-icons/io/IoIosSearch.svelte";
  export let search_term = "";
</script>

<div class="relative">
  <label for="searchBooks" class="sr-only"> Search </label>
  <input
    bind:value={search_term}
    id="searchBooks"
    type="search"
    class="input rounded-md pr-10 shadow-sm sm:text-sm w-full mt-0"
    placeholder="Search for books.."
  />
  <span
    class="pointer-events-none absolute inset-y-0 right-0 grid w-7 mx-1 mt-1 place-content-center 
  text-svelte dark:text-svelte_dark "
  >
    <IoIosSearch />
  </span>
</div>
