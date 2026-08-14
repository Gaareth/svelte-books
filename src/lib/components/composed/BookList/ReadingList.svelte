<script lang="ts">
    import { onDestroy } from "svelte";

    import { run } from "svelte/legacy";
    import { fade, scale } from "svelte/transition";
    //@ts-ignore
    import MoreIcon from "svelte-icons/io/IoMdMore.svelte";

    import BookSearch from "../BookSearch.svelte";
    import Filtering from "./Filtering.svelte";
    import ReadingListItem from "./ReadingListItem.svelte";

    import type { ReadingListItemType } from "$appTypes";

    import { invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import ReadingActivityDeletePopUp from "$components/composed/ReadingActivity/ReadingActivityDeletePopUp.svelte";
    import { createSearchStore, searchHandler } from "$lib/stores/search";

    interface Props {
        entries: (ReadingListItemType & { active?: boolean })[];
        showSearch?: boolean;
        isAuthorizedToModify?: boolean;
    }

    let {
        entries,
        showSearch = true,
        isAuthorizedToModify = false,
    }: Props = $props();

    // svelte-ignore state_referenced_locally
    const searchStore = createSearchStore(entries);
    let added_book = $state(false);

    let languages_used: string[] = $derived(entries.reduce((result, b) => {
            let lang = b.book.bookApiData?.language;
            if (lang !== undefined && !result.includes(lang)) {
                return result.concat(lang);
            }
            return result;
        }, [] as string[]))
    let category_names: string[] = $derived([
        ...new Set(
            entries
                .map((b) => b.book.bookApiData?.categories.map((c) => c.name))
                .flat()
                .filter((n) => n != null),
        ),
    ]);

    $effect(() => {
        added_book = true;
        $searchStore.data = entries;
    });

    let books_displayed = $derived($searchStore.filtered);

    const unsubscribe = searchStore.subscribe((model) => searchHandler(model));
    onDestroy(() => {
        unsubscribe();
    });

    let deletionEntry: ReadingListItemType | undefined = $state();
    let openModal = $state(false);

    let showOptions = $state(false);
    run(() => {
        let params = $page.url.searchParams;
        showOptions =
            (!!params.get("filter") ||
                !!params.get("sort") ||
                !!params.get("order")) ??
            false;
    });

    const animate = (node: any, args: any) => {
        const animation = added_book
            ? scale(node, args)
            : fade(node, { duration: 0, delay: 0 });
        added_book = false;
        return animation;
    };

    const openPopup = (entry: ReadingListItemType) => {
        openModal = true;
        deletionEntry = entry;
    };
</script>

<div class="flex justify-between mt-8 mb-2 sm:flex-row flex-col">
    <h2 class="flex items-end text-2xl -mb-1">
        Books
        {#if !showOptions}
            ({books_displayed.length})
        {/if}
    </h2>
    <div class="flex gap-1 sm:gap-2">
        {#if entries.length > 0 && showSearch}
            <BookSearch bind:search_term={$searchStore.search} />
            <button
                class="btn-generic-icon ml-auto"
                onclick={() => (showOptions = !showOptions)}>
                <span class="w-5 block">
                    <MoreIcon />
                </span>
            </button>
        {/if}
        <!-- <Dropdown
      buttonClass="btn-generic-icon"
      contentClass="!border-0 !p-0 !bg-transparent"
    >
      <span class="w-5 block" slot="triggerContent">
        <MoreIcon />
      </span>

      <div
        slot="dropdown"
        class="max-w-96 w-auto p-3 border rounded-md dark:border-slate-500 dark:bg-slate-700 flex flex-col bg-white"
      >
        hello
      </div>
    </Dropdown> -->
    </div>
</div>
<!-- TODO: filtering as modal -->
<div hidden={!showOptions}>
    <Filtering {searchStore} {languages_used} {category_names} />
</div>

<h2
    class="flex items-end text-xl -mb-1 {!showOptions
        ? 'hidden'
        : ''} text-secondary">
    {books_displayed.length} results
</h2>

<p class="text-center text-gray-600 dark:text-slate-300">
    {#if entries.length <= 0 && isAuthorizedToModify}
        No books added at the moment :(. Add one above!
    {:else if entries.length <= 0}
        No public books to display.
    {:else if $searchStore.filtered.length <= 0}
        No books found matching your search :(
    {/if}
</p>

<div class="dark:bg-slate-800 bg-white">
    {#each books_displayed as entry (entry.id)}
        <div>
            <ReadingListItem
                {entry}
                onDelete={openPopup}
                {isAuthorizedToModify} />
        </div>
    {/each}
</div>

{#if deletionEntry}
    <ReadingActivityDeletePopUp
        {deletionEntry}
        bind:openModal
        onSuccess={() => {
            openModal = false;
            invalidateAll();
        }} />
{/if}
