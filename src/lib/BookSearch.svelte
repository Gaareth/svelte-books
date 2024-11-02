<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  //@ts-ignore
  import IoIosSearch from "svelte-icons/io/IoIosSearch.svelte";
  import { replaceStateWithQuery } from "./utils";
  export let search_term = "";

  // onMount(() => {
  //   search_term = $page.url.searchParams.get("q") ?? "";
  // })

  $: search_term = $page.url.searchParams.get("q") ?? "";
  // $: {
  //   console.log($page.url.searchParams.get("q"));

  //   $page.url.searchParams
  // }

  const onKeyUp = (e: Event) => {
    if (!e.target) return;
    let query = (e.target as HTMLInputElement).value;
    let params = $page.url.searchParams;
    params.set("q", query);
    goto(`?${params}`, {
      noScroll: true,
    });
    // replaceStateWithQuery({q: query})
  };
</script>

<div class="relative">
  <label for="searchBooks" class="sr-only"> Search </label>
  <input
    value={search_term}
    on:keyup={onKeyUp}
    id="searchBooks"
    type="search"
    class="input rounded-md pr-10 shadow-sm sm:text-sm w-full mt-0 dark:border-slate-600"
    placeholder="Search for books.."
  />
  <span
    class="pointer-events-none absolute inset-y-0 right-0 grid w-7 mx-1 mt-1 place-content-center
  text-svelte dark:text-svelte_dark"
  >
    <IoIosSearch />
  </span>
</div>
