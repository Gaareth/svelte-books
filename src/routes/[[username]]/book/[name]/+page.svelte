<script lang="ts">
    import clsx from "clsx";

    import type { ActionData, PageData } from "./$types";

    import { goto, invalidateAll } from "$app/navigation";
    import { page } from "$app/stores";
    import BookFullReadingActivity from "$components/composed/Book/BookFullReadingActivity.svelte";
    import BookDeletePopUp from "$components/composed/BookDeletePopUp.svelte";
    import BookListSeries from "$components/composed/BookList/BookListSeries.svelte";
    import ReadingActivityForm from "$components/composed/ReadingActivity/ReadingActivityForm.svelte";
    //@ts-ignore
    import Calendar from "$lib/icons/Calender.svelte";
    import Pages from "$lib/icons/pages.svelte";
    import Words from "$lib/icons/words.svelte";
    import { sortReadingActivity } from "$lib/utils/utils";
    import BookCategories from "$src/lib/components/composed/Book/BookCategories.svelte";
    import BookForm from "$src/lib/components/composed/Book/BookForm.svelte";
    import BookImageAndInfo from "$src/lib/components/composed/Book/BookImageAndInfo.svelte";
    interface Props {
        data: PageData;
        form: ActionData;
    }

    let { data, form }: Props = $props();

    // svelte-ignore state_referenced_locally
    let book = $state(data.book);

    $effect(() => {
        book = data.book;
    });

    let open_delete = $state(false);
    let edit: boolean | undefined = $state();
    function onEdit() {
        edit = !edit;
        let query = new URLSearchParams($page.url.searchParams.toString());
        query.set("edit", edit.toString());
        goto(`?${query.toString()}`);
    }

    // import { onNavigate } from "$app/navigation";

    // onNavigate((navigation) => {
    //   if (!document.startViewTransition) return;

    //   return new Promise((resolve) => {
    //     document.startViewTransition(async () => {
    //       resolve();
    //       await navigation.complete;
    //     });
    //   });
    // });

    //TODO: cleanup

    let showCreateReadingActivity = $state(false);

    $effect(() => {
        edit =
            ((data.edit !== "false" && data.edit !== null) || !!form?.errors) &&
            data.isAuthorizedToModify;
    });

    let readingActivitiesSorted = $derived(
        [...book.readingActivity].sort((a, b) => {
            return sortReadingActivity(a, b);
        }),
    );
    let activeEntry = $derived(readingActivitiesSorted[0]);
</script>

<svelte:head>
    <title>{book.name}</title>
</svelte:head>

<div class="mt-5">
    <div>
        <div
            class="lg:grid lg:grid-cols-[20%_1fr] items-start mx-auto gap-x-5 lg:px-0">
            <BookImageAndInfo {edit} {book} />

            <div class={clsx("flex flex-col gap-7")}>
                <div
                    class={clsx(
                        "lg:item-border-no-hover p-1 lg:p-4 flex flex-col",
                    )}>
                    <div class="flex flex-col-reverse lg:flex-row">
                        <h1
                            class="text-4xl overflow-hidden text-ellipsis font-bold">
                            {book.name}
                        </h1>

                        {#if data.isAuthorizedToModify}
                            <div class="flex justify-center lg:ml-auto">
                                <div class="sm:flex sm:flex-col sm:gap-1">
                                    <span
                                        class="btn-group mb-2 dark:bg-slate-600 dark:border-slate-500">
                                        <button
                                            class="btn-group-btn dark:bg-slate-600 dark:border-slate-500 dark:hover:bg-slate-500"
                                            type="button"
                                            onclick={onEdit}>
                                            {edit ? "Cancel" : "Edit"}
                                        </button>
                                        {#if edit}
                                            <button
                                                form="form-book"
                                                class="btn-group-btn text-blue-700
              dark:bg-slate-600 dark:border-slate-500 dark:hover:bg-slate-500 dark:text-blue-500">
                                                Save
                                            </button>
                                        {/if}
                                        <button
                                            onclick={() =>
                                                (open_delete = !open_delete)}
                                            type="button"
                                            class="text-red-700 btn-group-btn
              dark:bg-slate-600 dark:border-slate-500 dark:hover:bg-slate-500 dark:text-red-500">
                                            Delete
                                        </button>
                                    </span>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <span class="-mt-1 dark:text-slate-100 text-gray-500">
                        {book.author}
                    </span>

                    {#if book.wordsPerPage != null || book.bookApiData?.pageCount != null || book.bookApiData?.publishedDate != null}
                        <div class="flex flex-wrap gap-2 lg:gap-4">
                            {#if book.bookApiData?.pageCount != null}
                                <span class="flex items-center gap-1">
                                    {book.bookApiData?.pageCount}
                                    <span class="w-5 block mt-0.5">
                                        <Pages />
                                    </span>
                                </span>

                                <span
                                    class="text-base flex items-center mb-[0.075rem]">
                                    •
                                </span>
                            {/if}

                            {#if book.wordsPerPage != null}
                                <span class="flex items-center gap-1">
                                    {book.wordsPerPage}
                                    <span class="w-5 block mt-0.5">
                                        <Words />
                                    </span>
                                </span>
                                <span
                                    class="text-base flex items-center mb-[0.075rem]">
                                    •
                                </span>
                            {/if}

                            {#if book.bookApiData?.publishedDate != null}
                                <span class="flex items-center gap-1">
                                    {book.bookApiData?.publishedDate}
                                    <span class="w-5 block"><Calendar /></span>
                                </span>
                            {/if}
                        </div>
                    {/if}

                    <div class="text-secondary flex flex-col lg:hidden">
                        <span class="text-base leading-snug">
                            Publisher: {book.bookApiData?.publisher ??
                                "Unknown"}
                        </span>
                        <span class="text-base leading-snug">
                            ISBN: {book.bookApiData?.isbn_13 ?? "Unknown"}
                        </span>
                        <span class="text-base leading-snug">
                            Language: {book.bookApiData?.language ?? "Unknown"}
                        </span>
                    </div>

                    <p class="mt-2 mb-3 text-secondary line-clamp-5">
                        {book.description ?? "No description available."}
                    </p>

                    <BookCategories categories={book.bookApiData?.categories} />
                </div>

                <BookFullReadingActivity
                    {book}
                    {activeEntry}
                    isAuthorizedToModify={data.isAuthorizedToModify}
                    bind:showCreateReadingActivity
                    {readingActivitiesSorted} />
            </div>
        </div>

        {#if !edit}
            <div>
                {#if book.bookSeries !== undefined && book.bookSeries !== null && book.bookSeries.books.length > 0}
                    <section>
                        <h2 class="text-xl mt-5">Series</h2>
                        <p class="text-slate-500 text-base">
                            the following books are also in this series:
                        </p>
                        <div>
                            <BookListSeries books={book.bookSeries.books} />
                        </div>
                    </section>
                {/if}
            </div>
        {:else}
            <hr class="my-5 dark:border-slate-600" />

            <!-- Inputs -->
            <section class="w-full mt-0">
                <!-- <h2 class="text-3xl">Edit</h2> -->
                <BookForm
                    {form}
                    bind:book
                    bookLists={data.bookLists}
                    books={data.books} />
            </section>
        {/if}
    </div>
</div>

<ReadingActivityForm
    bind:showModal={showCreateReadingActivity}
    {book}
    bookId={book.id} />

<BookDeletePopUp
    bind:openModal={open_delete}
    deletionBook={book}
    on:success={async () => {
        await invalidateAll();
        goto("/");
    }} />

<style>
    :global(.autocomplete) {
        width: 100%;
    }
</style>
