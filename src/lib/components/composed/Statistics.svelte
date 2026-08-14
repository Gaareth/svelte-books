<script lang="ts">
    //@ts-ignore

    import type { ReadingActivityList } from "$src/app";

    import Charts from "$components/composed/Charts.svelte";
    import Stats from "$components/composed/Stats.svelte";
    import ToggleGroup from "$components/input/ToggleGroup.svelte";
    import Modal from "$components/Modal.svelte";
    import {
        ACQUIRED,
        READING,
        READING_ACTIVITY_TYPES,
        TO_READ,
    } from "$lib/constants/enums";
    import Book from "$lib/icons/book.svelte";
    import Pages from "$lib/icons/pages.svelte";
    import Words from "$lib/icons/words.svelte";
    import { getReadingActivityColor } from "$src/lib/constants/constants";
    import DynamicArrow from "$src/lib/icons/DynamicArrow.svelte";
    import {
        books_read_per_month,
        books_read_per_year,
        calc_most_read_authors,
        calc_most_read_categories,
        count_pages,
        count_words,
        get_average_acquisition_time,
        get_reading_duration,
    } from "$src/lib/utils/statisticUtils";

    type ActivityStatistics = ReadingActivityList;

    interface Props {
        readingActivities?: ActivityStatistics[];
    }

    let { readingActivities = [] }: Props = $props();

    // Derived reactive variables
    let readingActivitiesFinished = $derived(
        readingActivities.filter(
            (a) => a.status?.status === READING_ACTIVITY_TYPES.FINISHED,
        ),
    );

    let most_read_categories = $derived(
        calc_most_read_categories(readingActivitiesFinished),
    );

    let books_without_pagecount = $derived(
        readingActivitiesFinished.filter(
            (e) => e.book.bookApiData?.pageCount == null,
        ),
    );
    let books_without_words = $derived(
        readingActivitiesFinished.filter(
            (e) =>
                e.book.bookApiData?.pageCount == null ||
                e.book.wordsPerPage == null,
        ),
    );

    let num_pages = $derived(count_pages(readingActivitiesFinished));
    let pagecount_accuracy = $derived(
        readingActivitiesFinished.length === 0
            ? 0
            : 1 -
                  books_without_pagecount.length /
                      readingActivitiesFinished.length,
    );

    let num_words = $derived(count_words(readingActivitiesFinished));
    let wordcount_accuracy = $derived(
        readingActivitiesFinished.length === 0
            ? 0
            : 1 - books_without_words.length / readingActivitiesFinished.length,
    );

    let showModal = $state(false);
    let showModalCats = $state(false);
    let showModalAuthors = $state(false);
    let showReadingDurationModal = $state(false);

    let selected_option: "books" | "pages" | "words" = $state("books");

    let now = $derived(new Date());

    let books_this_month = $derived(
        books_read_per_month(
            now.getMonth() + 1,
            now.getFullYear(),
            readingActivitiesFinished,
        ),
    );
    let books_last_month = $derived(
        books_read_per_month(
            now.getMonth(),
            now.getFullYear(),
            readingActivitiesFinished,
        ),
    );

    let pages_this_month = $derived(count_pages(books_this_month));
    let words_this_month = $derived(count_words(books_this_month));

    let pages_last_month = $derived(count_pages(books_last_month));
    let words_last_month = $derived(count_words(books_last_month));

    let books_this_year = $derived(
        books_read_per_year(now.getFullYear(), readingActivitiesFinished),
    );
    let books_last_year = $derived(
        books_read_per_year(now.getFullYear() - 1, readingActivitiesFinished),
    );
    let pages_this_year = $derived(count_pages(books_this_year));
    let words_this_year = $derived(count_words(books_this_year));
    let pages_last_year = $derived(count_pages(books_last_year));
    let words_last_year = $derived(count_words(books_last_year));

    let most_read_authors = $derived(
        calc_most_read_authors(readingActivitiesFinished),
    );

    // let reading_duration;
    let reading_duration = $derived(get_reading_duration(readingActivities));
    let reading_duration_histogram = $derived(
        reading_duration.histogram_ms.map(
            ([name, duration_ms]) =>
                [name, duration_ms / (1000 * 60 * 60 * 24)] as [string, number],
        ),
    ); // convert ms to days

    let reading_duration_average_days = $derived(
        (reading_duration.averageDuration_ms / (1000 * 60 * 60 * 24)).toFixed(
            2,
        ),
    );
    let reading_duration_total_days = $derived(
        (reading_duration.totalDuration_ms / (1000 * 60 * 60 * 24)).toFixed(2),
    );

    let avg_acquisition_time = $derived(
        get_average_acquisition_time(readingActivities),
    );
</script>

<div
    class="flex flex-col sm:flex-row gap-1 sm:gap-5 mb-1 items-center sm:h-12 sm:overflow-hidden">
    <ToggleGroup
        options={["books", "pages", "words"]}
        groupClass="inline-flex"
        btnClass="px-4 py-1 border border-s-0 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 flex items-center gap-1"
        btnSelectedClass="dark:bg-slate-700 bg-gray-50"
        startClass="border-s rounded-s-md"
        endClass="rounded-e-md"
        bind:selectedOption={selected_option}>
        {#snippet children({ option })}
            {#if option == "books"}
                <span class="w-5"><Book /></span>
                books
            {:else if option == "pages"}
                <span class="w-5"><Pages /></span>
                pages
            {:else}
                <span class="w-5"><Words /></span>
                words
            {/if}
        {/snippet}
    </ToggleGroup>

    <div class="text-secondary text-base">
        {#if selected_option == "pages" && pagecount_accuracy < 1}
            <div class="-mb-1">
                {(pagecount_accuracy * 100).toFixed(2)}% Accuracy
            </div>
            <div>
                {books_without_pagecount.length} books without pagecount. See
                <button
                    class="!text-base link-all"
                    onclick={() => (showModal = true)}>
                    all
                </button>
            </div>
        {:else if selected_option == "words" && wordcount_accuracy < 1}
            <div class="-mb-1">
                {(wordcount_accuracy * 100).toFixed(2)}% Accuracy
            </div>
            <div>
                {books_without_words.length} books without words per page info. See
                <button
                    class="!text-base link-all"
                    onclick={() => (showModal = true)}>
                    all
                </button>
            </div>
        {/if}
    </div>
</div>

<Modal bind:showModal>
    {#snippet header()}
        <div>
            <p class="font-medium sm:text-lg">
                {#if selected_option == "pages"}
                    Books without page count
                {:else}
                    Books without words per page info
                {/if}
            </p>
        </div>
    {/snippet}
    <ul class="list-disc p-2 sm:w-[30rem]">
        {#each selected_option == "pages" ? books_without_pagecount : books_without_words as entry}
            <li>
                <a
                    href={`/book/${entry.book.name}?edit=true`}
                    class="hover:underline">
                    {entry.book.name}
                </a>
            </li>
        {/each}
    </ul>
</Modal>

<div
    class="grid grid-rows-2 grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-2 stats-wrapper">
    {#if selected_option == "books"}
        <Stats
            titleString="total books read"
            value={readingActivitiesFinished.length}
            class="!bg-transparent backdrop-blur" />
    {:else if selected_option == "pages"}
        <Stats
            titleString="total pages read"
            class="!bg-transparent backdrop-blur">
            {#snippet valueSnippet()}
                <div class="flex gap-1 items-center">
                    <p class="text-4xl font-bold self-center">
                        {num_pages.toLocaleString("en-US")}
                    </p>
                </div>
            {/snippet}
        </Stats>
    {:else}
        <Stats
            titleString="total words read"
            class="!bg-transparent backdrop-blur">
            {#snippet valueSnippet()}
                <div class="flex flex-wrap gap-1 items-center">
                    <p class="text-3xl font-bold self-center break-all">
                        {num_words.toLocaleString("en-US")}
                    </p>
                </div>
            {/snippet}
        </Stats>
    {/if}

    {#if selected_option == "books"}
        <Stats
            titleString="books read this month"
            value={books_this_month.length}
            last_value={books_last_month.length}
            class="!bg-transparent backdrop-blur" />
    {:else if selected_option == "pages"}
        <Stats
            titleString="pages read this month"
            value={pages_this_month}
            last_value={pages_last_month}
            class="!bg-transparent backdrop-blur" />
    {:else}
        <Stats
            titleString="words read this month"
            value={words_this_month}
            last_value={words_last_month}
            class="!bg-transparent backdrop-blur" />
    {/if}

    {#if books_last_year.length > 0 || true}
        {#if selected_option == "books"}
            <Stats
                titleString="books read this year"
                value={books_this_year.length}
                last_value={books_last_year.length}
                class="!bg-transparent backdrop-blur" />
        {:else if selected_option == "pages"}
            <Stats
                titleString="pages read this year"
                value={pages_this_year}
                last_value={pages_last_year}
                class="!bg-transparent backdrop-blur" />
        {:else}
            <Stats
                titleString="words read this year"
                value={words_this_year}
                last_value={words_last_year}
                class="!bg-transparent backdrop-blur" />
        {/if}
    {/if}
</div>

<div
    class="grid grid-rows-2 grid-cols-1 sm:grid-rows-1 sm:grid-cols-12 gap-2 mb-2">
    <Stats
        titleString="average reading time"
        class="!bg-transparent backdrop-blur col-span-full sm:col-span-5"
        showStatsButton={true}
        onShowStats={() => (showReadingDurationModal = true)}>
        {#snippet valueSnippet()}
            <p class="font-bold self-center text-5xl flex flex-col">
                {reading_duration_average_days} days
                <span class="text-secondary text-base">
                    {reading_duration_total_days} total days
                </span>
            </p>
        {/snippet}
    </Stats>

    <Stats
        titleString="average acquisition time (days)"
        class="!bg-transparent backdrop-blur sm:col-span-7">
        {#snippet valueSnippet()}
            <div class="flex flex-col w-full gap-1.5">
                <div class="flex items-end gap-3 justify-between break-keep">
                    <p>To-Read</p>

                    <div class="flex flex-col text-center">
                        <p class="-mb-1 font-bold">
                            {#if avg_acquisition_time.avg_to_read_to_acquired_days.count > 0}
                                {avg_acquisition_time
                                    .avg_to_read_to_acquired_days.days}
                            {:else}
                                N/A
                            {/if}
                        </p>
                        <div>
                            <DynamicArrow
                                minThickness={4}
                                colorStart={getReadingActivityColor(TO_READ)}
                                colorEnd={getReadingActivityColor(ACQUIRED)} />
                        </div>
                    </div>

                    <p>Acquired</p>

                    <div class="flex flex-col text-center">
                        <p class="-mb-1 font-bold">
                            {#if avg_acquisition_time.avg_acquired_to_reading_days.count > 0}
                                {avg_acquisition_time
                                    .avg_acquired_to_reading_days.days}
                            {:else}
                                N/A
                            {/if}
                        </p>
                        <DynamicArrow
                            minThickness={4}
                            colorStart={getReadingActivityColor(ACQUIRED)}
                            colorEnd={getReadingActivityColor(READING)} />
                    </div>

                    <p>Reading</p>
                </div>

                <div class="text-center">
                    <p class="-mb-1 font-bold">
                        {#if avg_acquisition_time.avg_to_read_to_reading_days.count > 0}
                            {avg_acquisition_time.avg_to_read_to_reading_days
                                .days}
                        {:else}
                            N/A
                        {/if}
                    </p>
                    <DynamicArrow
                        maxThickness={1.5}
                        colorStart={getReadingActivityColor(TO_READ)}
                        colorEnd={getReadingActivityColor(READING)} />
                </div>
            </div>
        {/snippet}
    </Stats>
</div>

<div class="grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 gap-2">
    {#if readingActivitiesFinished.length > 0}
        <Stats
            titleString="most read author"
            value={most_read_authors[0][0] +
                " (" +
                most_read_authors[0][1] +
                ")"}
            class="!bg-transparent backdrop-blur"
            showStatsButton={true}
            onShowStats={() => (showModalAuthors = true)} />
    {/if}
    {#if readingActivitiesFinished.length > 0 && most_read_categories[0] !== undefined}
        <Stats
            titleString={most_read_categories[0][0] +
                " (" +
                most_read_categories[0][1] +
                ")"}
            name="most read genre/category"
            showStatsButton={true}
            onShowStats={() => (showModalCats = true)}
            class="!bg-transparent backdrop-blur" />
    {/if}
</div>

<Modal bind:showModal={showModalCats} className="w-[900px]">
    {#snippet header()}
        <div>
            <p class="font-medium sm:text-lg">Most read categories</p>
        </div>
    {/snippet}

    <Charts data={most_read_categories} />
</Modal>

<Modal bind:showModal={showModalAuthors} className="w-[900px]">
    {#snippet header()}
        <div>
            <p class="font-medium sm:text-lg">Most read authors</p>
        </div>
    {/snippet}

    <Charts data={most_read_authors} />
</Modal>

<Modal bind:showModal={showReadingDurationModal} className="w-[900px]">
    {#snippet header()}
        <div>
            <p class="font-medium sm:text-lg">Reading Duration</p>
        </div>
    {/snippet}

    <!-- TODO: format as hours if less than a day, or just add hours to days  -->
    <Charts
        data={reading_duration_histogram}
        label="days from start to finish" />
</Modal>

<!-- <style>
  /* @media screen and (max-width: 640px) {
    .stats-wrapper {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  } */
</style> -->

<style lang="postcss">
    .link-all {
        @apply text-slate-600 dark:text-slate-300 hover:underline;
    }
</style>
