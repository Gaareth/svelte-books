<script lang="ts">
    import toast from "svelte-french-toast";

    import BookApiDataEdit from "./BookApiDataEdit.svelte";
    import InputAny from "../../input/InputAny.svelte";
    import InputNumber from "../../input/InputNumber.svelte";
    import InputText from "../../input/InputText.svelte";
    import BookListSeries from "../BookList/BookListSeries.svelte";

    import type {
        BookFullType,
        BookRating,
        BookWithImage,
        queriedBookFull,
    } from "$src/app";
    import type { Book, BookList, Prisma } from "$prismaBrowser";
    import type { ActionData } from "../../../../routes/[[username]]/book/[name]/$types";

    import { enhance, applyAction } from "$app/forms";
    import AddIcon from "$src/lib/icons/AddIcon.svelte";
    import AutoComplete5 from "../../input/AutoComplete5.svelte";
    import { resolveAPIImageUrl } from "$src/lib/utils/browserUtils";
    import { getMaxResolutionImage } from "$src/lib/utils/utils";

    type BookFormType = Prisma.BookGetPayload<{
        include: {
            bookSeries: {
                include: {
                    books: {
                        include: {
                            bookApiData: true;
                            coverImage: {
                                include: {
                                    variants: true;
                                };
                            };
                        };
                    };
                };
            };
            bookApiData: {
                include: {
                    categories: true;
                };
            };
            bookList: true;
            coverImage: true;
        };
    }>;

    interface Props {
        book: BookFormType;
        books: BookWithImage[];
        bookLists: BookList[];
        form?: ActionData;
        formId: string;
    }

    let {
        book = $bindable(),
        books,
        bookLists,
        form,
        formId,
    }: Props = $props();

    function getFormError(field: string) {
        return form?.errors?.[field as keyof typeof form.errors]?.[0];
    }

    const authorError = getFormError("author");
    const wordsPerPageError = getFormError("wordsPerPage");

    let tookOverGoogleBooksUrl: string | undefined | null = $state();

    function handleTakeOver(e: {
        queriedBook: queriedBookFull | undefined;
    }): void {
        console.log(e);
        if (e.queriedBook === undefined) {
            return;
        }

        book.description = e.queriedBook.volumeInfo.description ?? null;
        book.name = e.queriedBook.volumeInfo.title;
        book.author = e.queriedBook.volumeInfo.authors[0];

        // add the selected google books url to the form data so that it can be uploaded to the server
        console.log("Selected Google Books URL:", e.queriedBook.volumeInfo.imageLinks);
        tookOverGoogleBooksUrl = getMaxResolutionImage(JSON.stringify(e.queriedBook.volumeInfo.imageLinks));
        // set to null so that coverimage takes the api image instead as a kind of preview
        book.coverImage = null;
    }

    const autoCompleteBookLabel = (b: BookFullType) => {
        return b.name + " - " + b.author;
    };

    let selectedSeriesBook: BookRating | undefined = $state();
    const addBookSeries = () => {
        // copy to please the typechecker
        const seriesBook = selectedSeriesBook;

        if (seriesBook === undefined) {
            return;
        }

        let selectedBook = books.find((b) => b.name == seriesBook.name);
        if (!selectedBook) {
            series_error = "Please choose a valid book";
            return;
        }

        if (book.bookSeries === null) {
            book.bookSeries = { books: [], id: -1 };
        }

        let currentSeries = book.bookSeries?.books.map((b) => b.name);
        if (currentSeries?.includes(selectedBook.name)) {
            series_error = "This book is already in this book series";
            return;
        }

        book.bookSeries?.books.push(selectedBook);
        series_error = undefined;
    };

    let series_error: string | undefined = $state(undefined);
    const on_delete = (b: Book) => {
        const index = book.bookSeries?.books.map((b) => b.id).indexOf(b.id);

        if (index === undefined) {
            series_error = "The book is not part of a book series";
            return;
        }

        if (index > -1) {
            book.bookSeries?.books.splice(index, 1); // 2nd parameter means remove one item only
        }
        book = book;
        series_error = undefined;
    };

    let formElement: HTMLFormElement | undefined = $state();
</script>

<form
    action="?/save"
    method="POST"
    id={formId}
    enctype="multipart/form-data"
    bind:this={formElement}
    use:enhance={async ({ formData }) => {
        if (tookOverGoogleBooksUrl != null) {
            formData.set("selectedGoogleBooksUrl", tookOverGoogleBooksUrl);
        }
        console.log("Form data before submission:", formData);
        // upload the selected google books image to the server
        const selectedGoogleBooksUrl = formData.get("selectedGoogleBooksUrl");
        if (selectedGoogleBooksUrl) {
            console.log("Selected Google Books URL:", selectedGoogleBooksUrl);
            const resp = await fetch(
                resolveAPIImageUrl(String(selectedGoogleBooksUrl)),
            );
            if (!resp.ok) {
                toast.error("Failed to fetch image from Google Books");
                return;
            }

            const blob = await resp.blob();
            formData.set(
                "uploadedCoverImage",
                new File([blob], String(selectedGoogleBooksUrl), {
                    type: blob.type,
                }),
            );
        }

        return async ({ result }) => {
            if (result.type != "failure") {
                // formElement?.r
                toast.success("Successfully edited book");
            } else {
                toast.error("Failed editing book");
            }

            await applyAction(result);
        };
    }}>
    <input type="hidden" name="id" value={book.id} />

    <div class="grid grid-cols-1 sm:grid-cols-2 items-center sm:gap-3">
        <InputText
            displayName="Name:"
            bind:value={book.name}
            name="name"
            error={form?.errors && "name" in form.errors
                ? form.errors.name?.[0]
                : undefined} />
        <InputText
            displayName="Author:"
            bind:value={book.author}
            name="author"
            error={authorError} />

        <InputAny name="description" displayName="Description">
            {#snippet input()}
                <textarea
                    class="w-full input dark:bg-slate-700 text-lg"
                    name="description"
                    id="description"
                    bind:value={book.description}>
                </textarea>
            {/snippet}
        </InputAny>

        <!-- disabled for now, need list name and creation of new lists -->
        <!-- <InputSelect
            value={book.bookList?.name}
            displayName="List:"
            name={"listName"}
            error={listNameError}>
            {#each bookLists as list}
                <option value={list.name}>
                    {list.name}
                </option>
            {/each}
        </InputSelect> -->
    </div>

    <BookApiDataEdit
        data={book.bookApiData}
        onTakeOver={handleTakeOver}
        query={`${book.name} ${book.author}`} />

    <div class="my-7">
        <section class="mb-10">
            <h2 class="text-xl mt-5">Series</h2>
            <span class="text-base text-secondary">
                You can connect connect this book to other books in a series
                here.
            </span>
            <div class="flex gap-2 w-full items-center">
                <input
                    type="hidden"
                    name="bookSeriesId"
                    value={book.bookSeriesId} />
                <AutoComplete5
                    items={books.filter((b) => b.name != book.name)}
                    labelFunction={autoCompleteBookLabel}
                    bind:selectedItem={selectedSeriesBook}
                    class="input dark:bg-slate-700 dark:border-none w-full" />
                <button
                    title="Add book"
                    aria-label="Add book to book series"
                    type="button"
                    class="btn-primary-black !px-1 !py-1"
                    onclick={addBookSeries}
                    disabled={!selectedSeriesBook}>
                    <span class="block w-7">
                        <AddIcon />
                    </span>
                </button>
            </div>
            <p class="label-text-alt text-error" hidden={!series_error}>
                {series_error}
            </p>
            <div class="mt-2">
                <BookListSeries
                    books={book.bookSeries?.books ?? []}
                    {on_delete}
                    allow_deletion={true} />
            </div>
        </section>

        <section>
            <InputNumber
                inputClass="btn-generic px-0.5"
                value={book.wordsPerPage}
                name="wordsPerPage"
                displayName="Words per page estimate:"
                error={wordsPerPageError}
                clearButton={true} />
        </section>

        <div class="min-[500px]:flex min-[500px]:justify-end">
            <button
                formaction="?/save"
                class="bg-blue-700 text-white py-3 px-4 my-4 rounded-md w-full
            block sm:hidden min-[500px]:w-1/2">
                Save
            </button>
        </div>
    </div>
</form>
