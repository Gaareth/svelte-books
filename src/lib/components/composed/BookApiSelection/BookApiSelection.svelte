<script lang="ts">
    import BookApiSkeleton from "./BookApiSkeleton.svelte";

    import type { queriedBook, ReadingActivityList } from "$appTypes";

    import { getReadingActivityColor } from "$src/lib/constants/constants";
    import { preventDefault } from "$src/lib/utils/event-modifers";
    import { capitalize, sortReadingActivity } from "$src/lib/utils/utils";
    import KeyboardArrowRight from "$src/lib/icons/KeyboardArrowRight.svelte";

    let queriedBooksPromise = $state<Promise<queriedBook[]> | undefined>(
        undefined,
    );

    const queryBooks = async (): Promise<queriedBook[]> => {
        const response = await fetch(`/book/api/list/?query=${query}`);
        const data = await response.json();

        if (data.error !== undefined) {
            throw new Error(data.error);
        }

        return data;
    };

    const handleClick = async () => {
        queriedBooksPromise = queryBooks();
    };

    interface Props {
        readingActivities?: ReadingActivityList[];
        label: string;
        query?: string | undefined;
        selectedBookId: string | undefined;
        apiBookSelected: boolean;
        onSelectClicked?: () => void;
        [key: string]: any;
    }

    let {
        readingActivities = [],
        label,
        query = $bindable(),
        selectedBookId = $bindable(),
        apiBookSelected = $bindable(),
        onSelectClicked,
         
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

    function countMatches(haystack: string, needle: string) {
        let count = 0;

        for (let word of needle.split(" ")) {
            if (haystack.toLowerCase().includes(word.toLowerCase())) {
                count++;
            }
        }

        return count;
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
                countMatches(name, query!) + (b.volumeInfo.imageLinks ? 1 : 0)
            );
        };

        return books.sort((a, b) => {
            return scoreResult(b) - scoreResult(a); // sort descending
        });
    }
</script>

<div {...rest}>
    <label for="bookApiQuery" class="w-full text-lg">
        {label}
    </label>
    <form class="flex gap-2" onsubmit={preventDefault(handleClick)}>
        <input
            class="input btn-generic-color-2"
            type="text"
            id="bookApiQuery"
            bind:value={query} />

        <button
            type="submit"
            class="btn-primary-black"
            disabled={!query || query?.length === 0}>
            Search
        </button>
    </form>
    <div>
        {#if queriedBooksPromise !== undefined}
            {#await queriedBooksPromise}
                <BookApiSkeleton />
            {:then queriedBooks}
                {#each sortBookResults(queriedBooks) as book}
                    <label
                        style={`border-color: ${getColor(book)}`}
                        class="item-border p-2 my-2 grid grid-cols-[1fr_auto] sm:flex justify-between items-center gap-1">
                        <div class="flex items-center gap-4">
                            <div>
                                {#if book.volumeInfo.imageLinks?.smallThumbnail}
                                    <img
                                        src={book.volumeInfo.imageLinks
                                            .smallThumbnail}
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
                                    {book.volumeInfo.authors?.join(",") ??
                                        "unknown author"}
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-1 col-span-2 row-start-2">
                            {#each findActivities(book) as activity}
                                <p
                                    style={`background-color: ${getColor(
                                        book,
                                    )}`}
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
                                <span class="w-6 block">
                                    <KeyboardArrowRight />
                                </span>
                            </button>
                        </div>
                    </label>
                {/each}
            {:catch error}
                <p class="text-red-500 pt-1 text-sm">
                    System error: {error.message}.
                </p>
            {/await}
        {/if}
    </div>
</div>
