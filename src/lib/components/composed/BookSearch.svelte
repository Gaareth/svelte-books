<script lang="ts">
    import { onMount } from "svelte";

    import IoIosSearch from "svelte-icons/io/IoIosSearch.svelte";

    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    interface Props {
        search_term?: string;
    }

    let { search_term = $bindable("") }: Props = $props();

    onMount(() => {
        search_term = page.url.searchParams.get("q") ?? "";
    });

    $effect(() => {
        search_term = page.url.searchParams.get("q") ?? "";
    });

    const onKeyUp = (e: Event) => {
        if (!e.target) return;
        let query = (e.target as HTMLInputElement).value;
        search_term = query;

        let params = page.url.searchParams;
        params.set("q", query);
        goto(`?${params}`, {
            noScroll: true, 
            keepFocus: true
        });
        // replaceStateWithQuery({q: query})
    };
</script>

<div class="relative">
    <label for="searchBooks" class="sr-only">Search</label>
    <input
        value={search_term}
        onkeyup={onKeyUp}
        id="searchBooks"
        type="search"
        class="input input-color-1 rounded-md pr-10 shadow-sm sm:text-sm w-full mt-0 dark:border-slate-600"
        placeholder="Search for books.." />
    <span
        class="pointer-events-none absolute inset-y-0 right-0 grid w-7 mx-1 mt-1 place-content-center
  text-svelte dark:text-svelte_dark">
        <IoIosSearch />
    </span>
</div>
