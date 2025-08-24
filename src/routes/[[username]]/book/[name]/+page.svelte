<script lang="ts">
  import clsx from "clsx";
  //@ts-ignore
  import AutoComplete from "simple-svelte-autocomplete";
  import toast from "svelte-french-toast";
  // @ts-ignore
  import IoIosAdd from "svelte-icons/io/IoIosAdd.svelte";

  import type { ActionData, PageData } from "./$types";
  import type {
    BookFullType,
    BookListItemType,
    BookRating,
    queriedBookFull,
  } from "../../../../app";
  import type { BookList } from "@prisma/client";

  import { applyAction, enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import BookApiDataEdit from "$lib/Book/BookApiDataEdit.svelte";
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import BookListSeries from "$lib/BookList/BookListSeries.svelte";
  import ReadingActivityForm from "$lib/BookList/ReadingActivityForm.svelte";
  import ReviewListItem from "$lib/BookList/ReviewListItem.svelte";
  import AddIcon from "$lib/icons/AddIcon.svelte";
  import Calendar from "$lib/icons/Calender.svelte";
  import Pages from "$lib/icons/pages.svelte";
  import Words from "$lib/icons/words.svelte";
  import InputAny from "$lib/InputAny.svelte";
  import InputNumber from "$lib/InputNumber.svelte";
  import InputSelect from "$lib/InputSelect.svelte";
  import InputText from "$lib/InputText.svelte";
  //@ts-ignore
  import Pill from "$lib/Pill.svelte";
  import { getMaxResolutionImage } from "$lib/utils";

  export let data: PageData;

  // let book: BookAll;
  let book = data.book;
  let books = data.books;
  // console.log("books", books);

  // let no_rating = !data.book?.rating;

  $: {
    book = data.book;

    // if (book.rating === null && edit) {
    //   book.rating = { stars: 0, bookId: book.id, comment: "" };
    // }

    if (book.bookSeries === null && edit) {
      book.bookSeries = { books: [], id: -1 }; // very bad :(
    }

    console.log("book changed");
  }

  // console.log(data.book.bookSeries?.books);

  let bookLists: BookList[];

  $: bookLists = data.bookLists;

  let selectedSeriesBook: BookRating;

  // $: rating = book?.rating ?? { stars: 0, comment: "" };
  // $: rating_stars = rating.stars;
  // $: rating_comment = rating.comment;

  let open_delete = false;

  export let form: ActionData;
  let edit: boolean;

  $: edit =
    ((data.edit !== "false" && data.edit !== null) || !!form?.errors) &&
    data.isAuthorizedToModify;

  const addBookSeries = () => {
    if (!selectedSeriesBook) {
      return;
    }

    let selectedBook = books.find((b) => b.name == selectedSeriesBook.name);
    console.log(selectedSeriesBook);
    if (!selectedBook) {
      series_error = "Please choose a valid book";
      return;
    }

    console.log(book.bookSeries?.books);
    console.log(selectedBook);

    let currentSeries = book.bookSeries?.books.map((b) => b.name);
    if (currentSeries?.includes(selectedBook.name)) {
      series_error = "This book is already in this book series";
      return;
    }

    book.bookSeries?.books.push(selectedBook);
    book = book;
    series_error = undefined;
  };

  let series_error: string | undefined = undefined;
  const on_delete = (b: BookListItemType) => {
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

  const autoCompleteBookLabel = (b: BookFullType) => {
    return b.name + " - " + b.author;
  };

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

  let showCreateReadingActivity = false;

  const authorError =
    form?.errors != null && "author" in form?.errors
      ? form?.errors?.author?.[0]
      : undefined;

  const listNameError =
    form?.errors != null && "listName" in form?.errors
      ? form?.errors?.listName?.[0]
      : undefined;

  const wordsPerPageError =
    form?.errors != null && "wordsPerPage" in form?.errors
      ? form?.errors?.wordsPerPage?.[0]
      : undefined;

  //lg:group-hover:opacity-50
  const imageClass = ` transition-all duration-300 relative bg-background-elevated text-transparent
     w-[133px] h-[199px] sm:w-[320px] sm:h-[330px] aspect-[1/1.5] object-cover object-center rounded`;

  let bookImage: string | null;
  $: bookImage = book.coverImage ?? getMaxResolutionImage(book.bookApiData);

  function handleTakeOver(
    e: CustomEvent<{
      volumeId: string | undefined;
      queriedBook: queriedBookFull;
    }>
  ): void {
    book.description = e.detail.queriedBook.volumeInfo.description ?? null;
    book.name = e.detail.queriedBook.volumeInfo.title;
    book.author = e.detail.queriedBook.volumeInfo.authors[0];
    book.coverImage =
      e.detail.queriedBook.volumeInfo.imageLinks?.extraLarge ||
      e.detail.queriedBook.volumeInfo.imageLinks?.large ||
      e.detail.queriedBook.volumeInfo.imageLinks?.medium ||
      e.detail.queriedBook.volumeInfo.imageLinks?.thumbnail ||
      e.detail.queriedBook.volumeInfo.imageLinks?.smallThumbnail ||
      null;
  }
</script>

<svelte:head>
  <title>{book.name}</title>
</svelte:head>

<div class="mt-5">
  <form
    action="?/save"
    method="POST"
    id="form-book"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type != "failure") {
          toast.success("Successfully edited book");
        } else {
          toast.error("Failed editing book");
        }

        await applyAction(result);
      };
    }}>
    <div
      class="lg:grid lg:grid-cols-[20%_1fr] items-start mx-auto gap-x-5 lg:px-0">
      <div
        class={clsx(
          "lg:item-border-no-hover lg:p-4 relative",
          edit && "group"
        )}>
        <div class="flex justify-center relative">
          {#if bookImage != null}
            <img
              src={bookImage}
              class="hidden aspect-[390/321] w-screen sm:h-[400px] blur-[28px] h-[230px] rounded object-cover object-center -z-10 dark:lg:hidden dark:block"
              alt="Flowers for Algernon"
              width="246"
              height="369"
              fetchpriority="low"
              loading="lazy" />
            <div class="dark:hidden h-[230px]" />

            <img
              src={bookImage}
              class={clsx(
                "hidden blur-[20px] h-[330px] rounded object-cover object-center dark:lg:block absolute"
              )}
              alt="Flowers for Algernon"
              width="206"
              height="369"
              fetchpriority="low"
              loading="lazy" />
          {/if}

          <div
            class={clsx(
              bookImage &&
                "absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0"
            )}>
            {#if bookImage}
              <!-- <BookImage
                bookId={book.bookApiData?.id}
                alt="thumbnail"
                sizes="(width <= 1024px) 800px, 128px"
                class={imageClass} /> -->
              <img
                src={bookImage}
                alt="thumbnail fallback"
                class={imageClass} />
              <!-- {#if edit}
                <input
                  type="hidden"
                  name="coverImage"
                  value={book.coverImage} />
              {/if} -->
            {:else}
              <img
                src={"/cover.png"}
                alt="thumbnail fallback"
                class={imageClass} />
            {/if}
          </div>

          <!-- {#if edit}
            <div
              class="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <button
                type="button"
                class="btn-generic btn-generic-color-2 group-hover:visible invisible">
                Upload
              </button>
            </div>
          {/if} -->
        </div>

        <div class="hidden mt-3 text-secondary lg:flex flex-col">
          <span class="text-base leading-tight">
            Publisher: {book.bookApiData?.publisher ?? "Unknown"}
          </span>
          <span class="text-base leading-tight">
            ISBN: {book.bookApiData?.isbn_13 ?? "Unknown"}
          </span>
          <span class="text-base leading-tight">
            Language: {book.bookApiData?.language ?? "Unknown"}
          </span>
        </div>
      </div>

      <div class={clsx("flex flex-col gap-5")}>
        <div class={clsx("lg:item-border-no-hover p-1 lg:p-4 flex flex-col")}>
          <div class="flex flex-col-reverse lg:flex-row">
            <h1 class="text-4xl overflow-hidden text-ellipsis font-bold">
              {book.name}
            </h1>

            {#if data.isAuthorizedToModify}
              <div class="flex justify-center lg:ml-auto">
                <input type="hidden" name="id" value={book.id} />

                <div class="sm:flex sm:flex-col sm:gap-1">
                  <span
                    class="btn-group mb-2 dark:bg-slate-600 dark:border-slate-500">
                    <button
                      class="btn-group-btn dark:bg-slate-600 dark:border-slate-500 dark:hover:bg-slate-500"
                      type="button"
                      on:click={() => {
                        edit = !edit;

                        let query = new URLSearchParams(
                          $page.url.searchParams.toString()
                        );

                        query.set("edit", edit.toString());

                        goto(`?${query.toString()}`);
                      }}>
                      {edit ? "Cancel" : "Edit"}
                    </button>
                    {#if edit}
                      <button
                        class="btn-group-btn text-blue-700
              dark:bg-slate-600 dark:border-slate-500 dark:hover:bg-slate-500 dark:text-blue-500">
                        Save
                      </button>
                    {/if}
                    <button
                      on:click={() => (open_delete = !open_delete)}
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
                  <span class="w-5 block mt-0.5"><Pages /></span>
                </span>

                <span class="text-base flex items-center mb-[0.075rem]">•</span>
              {/if}

              {#if book.wordsPerPage != null}
                <span class="flex items-center gap-1">
                  {book.wordsPerPage}
                  <span class="w-5 block mt-0.5"><Words /></span>
                </span>
                <span class="text-base flex items-center mb-[0.075rem]">•</span>
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
              Publisher: {book.bookApiData?.publisher ?? "Unknown"}
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

          {#if (book.bookApiData?.categories ?? []).length > 0}
            <div class="flex flex-wrap gap-1">
              {#each book.bookApiData?.categories ?? [] as category}
                <Pill className="dark:bg-slate-600">
                  {category.name}
                </Pill>
              {/each}
            </div>
          {/if}
        </div>

        <div class="">
          <div class="flex mb-1 items-center">
            <h2 class="text-2xl">Reading Activity</h2>
            {#if data.isAuthorizedToModify}
              <button
                type="button"
                class="ml-auto btn-generic p-2"
                on:click={() => (showCreateReadingActivity = true)}
                title="Create reading activity">
                <span class="block w-5">
                  <AddIcon />
                </span>
              </button>
            {/if}
          </div>
          <!-- <hr class="border-slate-600 mt-2" /> -->
          {#each book.readingActivity as readingActivity}
            <ReviewListItem
              entry={readingActivity}
              isAuthorizedToModify={data.isAuthorizedToModify} />
          {/each}

          {#if book.readingActivity.length <= 0}
            <p class="text-secondary text-center">No reading activity found.</p>
          {/if}
        </div>
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

        <div class="grid grid-cols-1 sm:grid-cols-2 items-center sm:gap-3">
          <InputText
            bind:value={book.name}
            name="name"
            error={form?.errors && "name" in form.errors
              ? form.errors.name?.[0]
              : undefined} />
          <InputText
            bind:value={book.author}
            name="author"
            error={authorError} />

          <InputAny name="description" displayName="Description">
            <textarea
              slot="input"
              class="w-full input dark:bg-slate-700 text-lg"
              name="description"
              id="description"
              bind:value={book.description} />
          </InputAny>

          <InputSelect
            value={book.bookList?.name}
            displayName="List"
            name={"listName"}
            error={listNameError}>
            {#each bookLists as list}
              <option value={list.name}>
                {list.name}
              </option>
            {/each}
          </InputSelect>
        </div>

        <BookApiDataEdit
          data={book.bookApiData}
          on:takeOver={handleTakeOver}
          query={`${book.name} ${book.author}`} />

        <div class="my-7">
          <section class="mb-10">
            <h2 class="text-xl mt-5">Series</h2>
            <span class="text-base text-slate-500">
              Don't forget to press the big blue save button
            </span>
            <div class="mt-2 flex gap-2 w-full items-center">
              <input
                type="hidden"
                name="bookSeriesId"
                value={book.bookSeriesId} />
              <AutoComplete
                items={books.filter((b) => b.name != book.name)}
                labelFunction={autoCompleteBookLabel}
                bind:selectedItem={selectedSeriesBook}
                class="input dark:bg-slate-700 dark:border-none w-full" />
              <button
                title="Add book"
                aria-label="Add book to book series"
                type="button"
                class="btn-primary-black !px-1 !py-1"
                on:click={addBookSeries}
                disabled={!selectedSeriesBook}>
                <span class="block w-7">
                  <IoIosAdd />
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
              value={book.wordsPerPage}
              name="wordsPerPage"
              displayName="Words per page estimate"
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
      </section>
    {/if}
  </form>
</div>

<ReadingActivityForm
  bind:showModal={showCreateReadingActivity}
  bookId={book.id} />

<BookDeletePopUp
  bind:openModal={open_delete}
  deletionBook={book}
  on:success={() => {
    goto("/");
  }} />

<style>
  :global(.autocomplete) {
    width: 100%;
  }
</style>
