<script lang="ts">
    import BookApiSkeleton from "./BookApiSkeleton.svelte";

    import type { queriedBook, ReadingActivityList } from "$appTypes";

    import { getReadingActivityColor } from "$src/lib/constants/constants";
    import { capitalize } from "$src/lib/utils/utils";
    import { sortReadingActivity } from "$src/lib/utils/readingActivityUtils";
    import KeyboardArrowRight from "$src/lib/icons/KeyboardArrowRight.svelte";
    import type { Snippet } from "svelte";
    import Alert from "../../Alert.svelte";
    import { countSubstringMatches } from "$src/lib/utils/statisticUtils";

    let queriedBooksPromise = $state<Promise<queriedBook[]> | undefined>(
        undefined,
    );

    const queryBooks = async (): Promise<queriedBook[]> => {
        const response = await fetch(`/book/api/list/?query=${query}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ?? "Unknown Error fetching book API data",
            );
        }

        if (data.error !== undefined) {
            throw new Error(data.error);
        }

        if (data == null) {
            throw new Error("No books found");
        }

        console.log("queriedBooksPromise", data);

        return data;
    };

    const handleSearch = async () => {
        queriedBooksPromise = queryBooks();
    };

    export interface Props {
        readingActivities?: ReadingActivityList[];
        label: string;
        query?: string | undefined;
        selectedBookId: string | undefined;
        apiBookSelected: boolean;
        onSelectClicked?: () => void;

        searchEntriesWrapperClass?: string | undefined;
        ResultEntry?: Snippet<
            [queriedBook, string | undefined, (id: string) => void]
        >;
        filterFn?: (book: queriedBook) => boolean;
        [key: string]: unknown;
    }

    let {
        readingActivities = [],
        label,
        query = $bindable(),
        selectedBookId = $bindable(),
        apiBookSelected = $bindable(),
        onSelectClicked,
        ResultEntry,
        searchEntriesWrapperClass,
        filterFn,

        ...rest
    }: Props = $props();

    //TODO: make tabbable, the radio button

    function findActivities(book: queriedBook) {
        return readingActivities.filter(
            (a) => a.book.name === book.volumeInfo.title,
        );
    }

    function getColor(book: queriedBook) {
        let activity = findActivities(book).sort(sortReadingActivity)[0];

        if (activity?.status.status) {
            return getReadingActivityColor(activity.status.status);
        } else {
            return "";
        }
    }

    function sortBookResults(books: queriedBook[]) {
        if (query == undefined) {
            return books;
        }

        const scoreResult = (b: queriedBook) => {
            const name =
                b.volumeInfo.title +
                (b.volumeInfo.subtitle ?? "") +
                (b.volumeInfo.authors?.join(",") ?? "");
            return (
                countSubstringMatches(name, query!) +
                (b.volumeInfo.imageLinks ? 1 : 0)
            );
        };

        if (filterFn != null) {
            books = books.filter(filterFn);
        }

        return books.sort((a, b) => {
            return scoreResult(b) - scoreResult(a); // sort descending
        });
    }

    function onkeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    }
</script>

{#snippet GoogleBooksEntry(book: queriedBook)}
    <label
        style={`border-color: ${getColor(book)}`}
        class="item-border p-2 my-2 grid grid-cols-[1fr_auto] sm:flex justify-between items-center gap-1">
        <div class="flex items-center gap-4">
            <div>
                {#if book.volumeInfo.imageLinks?.smallThumbnail}
                    <img
                        src={book.volumeInfo.imageLinks.smallThumbnail}
                        alt="book cover"
                        class="w-10" />
                {:else}
                    <!-- ??TODO: placeholder -->
                    <img
                        src="/cover.png"
                        alt="placeholder book cover"
                        class="w-10" />
                {/if}
            </div>
            <div class="flex flex-col">
                <p class="text-base">
                    {book.volumeInfo.title}

                    {#if book.volumeInfo.subtitle}
                        ({book.volumeInfo.subtitle})
                    {/if}
                </p>
                <p class="text-base">
                    {book.volumeInfo.authors?.join(",") ?? "unknown author"}
                </p>
            </div>
        </div>

        <div class="flex gap-1 col-span-2 row-start-2">
            {#each findActivities(book) as activity (activity.id)}
                <p
                    style={`background-color: ${getColor(book)}`}
                    class="rounded-md text-sm font-medium px-1 text-white/90 uppercase">
                    {capitalize(activity.status.status)}
                </p>
            {/each}
        </div>

        <div class="flex items-center gap-2">
            <input
                type="radio"
                name="bookId"
                id={`bookId-${book.id}`}
                value={book.id}
                onclick={() => (selectedBookId = book.id)}
                class="mr-2 peer checked:hidden md:checked:block" />
            <button
                class="hidden peer-checked:flex px-3 py-1
                border rounded-md dark:border-slate-500 dark:bg-slate-600
                hover:bg-gray-50 dark:hover:bg-slate-500
                text-base flex-row items-center gap-1"
                onclick={() => {
                    apiBookSelected = true;
                    onSelectClicked?.();
                }}
                title="Select book"
                type="button">
                <span class="hidden md:inline">Select</span>
                <KeyboardArrowRight class="w-6 h-6 block" />
            </button>
        </div>
    </label>
{/snippet}

<div {...rest}>
    <label for="bookApiQuery" class="w-full text-lg">
        {label}
    </label>
    <div class="flex gap-2">
        <input
            class="input btn-generic-color-2"
            type="text"
            id="bookApiQuery"
            {onkeydown}
            value={query}
            oninput={(e) => (query = e.currentTarget.value)} />

        <button
            type="button"
            onclick={() => handleSearch()}
            class="btn-primary-black"
            disabled={!query || query?.length === 0}>
            Search
        </button>
    </div>
    <div>
        {#if queriedBooksPromise !== undefined}
            {#await queriedBooksPromise}
                <BookApiSkeleton />
            {:then queriedBooks}
                <div class={searchEntriesWrapperClass}>
                    {#if sortBookResults(queriedBooks).length === 0}
                        <p class="text-secondary pt-3 text-center">
                            No results found.
                        </p>
                    {/if}

                    {#each sortBookResults(queriedBooks) as book (book)}
                        {#if ResultEntry !== undefined}
                            {@render ResultEntry(book, selectedBookId, (id) => {
                                selectedBookId = id;
                                apiBookSelected = true;
                                onSelectClicked?.();
                            })}
                        {:else}
                            {@render GoogleBooksEntry(book)}
                        {/if}
                    {/each}
                </div>
            {:catch error}
                <Alert type="error">
                    System error: {error.message}.
                </Alert>
            {/await}
        {/if}
    </div>
</div>
