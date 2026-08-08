<script lang="ts">
    import BookApiConfirm from "./BookApiConfirm.svelte";
    import BookApiSelection from "./BookApiSelection.svelte";

    import type { queriedBookFull, ReadingActivityList } from "$appTypes";



    interface Props {
        volumeId?: string | undefined;
        query?: string | undefined;
        apiBookSelected?: boolean;
        getBookPromise?: Promise<queriedBookFull> | undefined;
        label: string;
        readingActivities?: ReadingActivityList[];
        onBackClicked?: () => void;
        onSelectClicked?: () => void;
    }

    let {
        volumeId = $bindable(),
        query = $bindable(),
        apiBookSelected = $bindable(false),
        getBookPromise = $bindable(),
        label,
        readingActivities = [],
        onBackClicked,
        onSelectClicked
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
        {onBackClicked} />
</div>

<div hidden={apiBookSelected}>
    <BookApiSelection
        {label}
        {readingActivities}
        class="my-2"
        bind:selectedBookId={volumeId}
        bind:apiBookSelected
        bind:query
        {onSelectClicked} />
</div>
