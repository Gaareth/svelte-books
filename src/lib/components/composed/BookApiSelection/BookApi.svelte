<script lang="ts">
    import BookApiConfirm from "./BookApiConfirm.svelte";
    import BookApiSelection from "./BookApiSelection.svelte";

    import type { Props as BookApiSelectionProps } from "./BookApiSelection.svelte";
    import type { Props as BookApiConfirmProps } from "./BookApiConfirm.svelte";

    // to remove the rest prop type
    type RemoveIndexSignature<T> = {
        [K in keyof T as string extends K ? never : K]: T[K];
    };
    type SelectionProps = RemoveIndexSignature<BookApiSelectionProps>;

    type Props = Omit<BookApiConfirmProps, "volumeId" | "apiBookSelected"> &
        Omit<SelectionProps, "selectedBookId" | "apiBookSelected"> & {
            volumeId?: string;
            apiBookSelected?: boolean;
        };


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
        filterFn,
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
        {filterFn}
        {searchEntriesWrapperClass} />
</div>
