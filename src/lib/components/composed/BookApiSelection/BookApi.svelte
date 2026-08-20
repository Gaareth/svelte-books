<script lang="ts">
    import BookApiConfirm from "./BookApiConfirm.svelte";
    import BookApiSelection from "./BookApiSelection.svelte";

    import type {
        queriedBook,
        queriedBookFull,
        ReadingActivityList,
    } from "$appTypes";
    import type { Snippet } from "svelte";

    interface Props {
        volumeId?: string | undefined;
        query?: string | undefined;
        apiBookSelected?: boolean;
        getBookPromise?: Promise<queriedBookFull> | undefined;
        label: string;
        readingActivities?: ReadingActivityList[];
        onBackClicked?: () => void;
        onSelectClicked?: () => void;
        APIResult?: Snippet<[queriedBookFull]>;
        ResultEntry?: Snippet<[queriedBook, string | undefined, (id: string) => void]>;
        searchEntriesWrapperClass?: string | undefined;
    }

    let {
        volumeId = $bindable(),
        query = $bindable(),
        apiBookSelected = $bindable(false),
        getBookPromise = $bindable(),
        label,
        readingActivities = [],
        onBackClicked,
        onSelectClicked,
        APIResult,
        ResultEntry,
        searchEntriesWrapperClass,
    }: Props = $props();

    async function getBook(id: string) {
        return (await fetch(`/book/api/get/${id}`)).json();
    }
    $effect(() => {
        if (volumeId !== undefined && apiBookSelected) {
            getBookPromise = getBook(volumeId);
        }
    });
</script>

<div hidden={!apiBookSelected || volumeId === undefined}>
    <BookApiConfirm
        {volumeId}
        bind:apiBookSelected
        {getBookPromise}
        {onBackClicked}
        {APIResult} />
</div>

<div hidden={apiBookSelected}>
    <BookApiSelection
        {label}
        {readingActivities}
        class="my-2"
        bind:selectedBookId={volumeId}
        bind:apiBookSelected
        bind:query
        {onSelectClicked}
        {ResultEntry}
        {searchEntriesWrapperClass} />
</div>
