<script lang="ts">
  import BookApiData from "./../../../lib/Book/BookApiData.svelte";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import AutoComplete from "simple-svelte-autocomplete";
  import Rating from "./../../../lib/Rating.svelte";
  import type { BookList, Prisma } from "@prisma/client";
  import { page } from "$app/stores";
  import { goto, invalidateAll } from "$app/navigation";
  import InputText from "$lib/InputText.svelte";
  import InputSelect from "$lib/InputSelect.svelte";
  //@ts-ignore
  import IoIosAdd from "svelte-icons/io/IoIosAdd.svelte";
  import type { ActionData, PageData } from "./$types";
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import InputNumber from "$lib/InputNumber.svelte";
  import type {
    BookFull,
    BookFullType,
    BookListItemType,
    BookRating,
  } from "../../../app";
  import BookListSeries from "$lib/BookList/BookListSeries.svelte";
  import BookListSimple from "$lib/BookList/BookListSimple.svelte";
  import BookApiDataEdit from "$lib/Book/BookApiDataEdit.svelte";
  import Image from "$lib/Image.svelte";

  import { MAX_RATING } from "../../../constants";
  import DateSelector, {
    DEFAULT_OPTIONAL_DATETIME,
    formatShort,
  } from "$lib/DateSelector.svelte";
  import EventProgress from "$lib/icons/EventProgress.svelte";
  import EventDone from "$lib/icons/EventDone.svelte";
  import InputAny from "$lib/InputAny.svelte";
  import { applyAction, enhance } from "$app/forms";
  import toast from "svelte-french-toast";

  export let data: PageData;

  // let book: BookAll;
  let book: BookFull = data.book;
  let books: BookFull[] = data.books;

  // let no_rating = !data.book?.rating;
  let no_rating = false;

  $: {
    book = data.book;

    if (book.rating === null && edit) {
      book.rating = { stars: 0, bookId: book.id, comment: "" };
    }

    if (book.bookSeries === null && edit) {
      book.bookSeries = { books: [], id: -1 }; // very bad :(
    }


    console.log("book changed");
  }

  // console.log(data.book.bookSeries?.books);

  let bookLists: BookList[];

  $: bookLists = data.bookLists;

  let selectedSeriesBook: BookRating;

  let thumbnailUrl = book.bookApiData?.thumbnailUrl;

  // $: rating = book?.rating ?? { stars: 0, comment: "" };
  // $: rating_stars = rating.stars;
  // $: rating_comment = rating.comment;

  let open_delete = false;

  export let form: ActionData;
  let edit: boolean;

  $: edit =
    ((data.edit !== "false" && data.edit !== null) || !!form?.errors) &&
    !!$page.data.session;

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
    const index = book.bookSeries?.books.indexOf(b);

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
    }}
  >
    {#if $page.data.session}
      <div class="flex justify-center mb-2 sm:mb-0">
        <input type="hidden" name="id" value={book.id} />

        <div class="sm:flex sm:flex-col sm:gap-1">
          <span
            class="btn-group mb-2 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-slate-500"
          >
            <button
              class="btn-group-btn
              dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"
              type="button"
              on:click={() => {
                edit = !edit;

                let query = new URLSearchParams(
                  $page.url.searchParams.toString()
                );

                query.set("edit", edit.toString());

                goto(`?${query.toString()}`);
              }}
            >
              {edit ? "Cancel" : "Edit"}
            </button>
            {#if edit}
              <button
                class="btn-group-btn text-blue-700
              dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 dark:text-blue-500"
              >
                Save
              </button>
            {/if}
            <button
              on:click={() => (open_delete = !open_delete)}
              type="button"
              class="text-red-700 btn-group-btn
              dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 dark:text-red-500"
            >
              Delete
            </button>
          </span>
        </div>
      </div>
    {/if}
    <div class="flex justify-between flex-col-reverse sm:flex-row mb-2 sm:mb-0">
      {#if thumbnailUrl != null}
        <Image src={thumbnailUrl} alt="thumbnail" />
      {/if}
      <h1 class="text-4xl overflow-hidden text-ellipsis">{book.name}</h1>
    </div>

    {#if !edit}
      <div>
        <div class="attribute-stats">
          <p>Author: {book.author}</p>
          <p>
            Started: {formatShort(book.dateStarted, true)}
          </p>
          <p>
            Read: {formatShort(book.dateFinished, true)}
          </p>
          <p>
            Added: {book.createdAt.toLocaleDateString()}
            {book.createdAt.toLocaleTimeString()}
          </p>
        </div>

        <BookApiData data={book.bookApiData} />

        <div class="my-7">
          {#if book.rating && !no_rating}
            <section class="flex gap-2 items-center">
              <h2 class="text-xl">Rating</h2>
              <p>({book.rating.stars}/{MAX_RATING})</p>
            </section>
            <Rating rating={book.rating.stars} rating_max={MAX_RATING} />

            {#if book.rating.comment && book.rating.comment.length > 0}
              <section class="py-2 my-2">
                <h2 class="text-xl">Comment</h2>
                <p>{book.rating.comment}</p>
              </section>
            {:else if $page.data.session}
              <button class="mt-5" on:click={() => (edit = !edit)}
                >Add a comment?</button
              >
            {/if}
          {:else}
            <h2>No rating...</h2>
          {/if}

          {#if book.bookSeries !== undefined && book.bookSeries !== null && book.bookSeries.books.length > 0}
            <section>
              <h2 class="text-xl mt-5">Series</h2>
              <p class="text-slate-500 text-base">
                following books are also in this series:
              </p>
              <div>
                <BookListSimple books={book.bookSeries.books} />
              </div>
            </section>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Inputs -->
      <div class="w-full">
        <div class="grid grid-cols-1 sm:grid-cols-2 items-center sm:gap-3">
          <InputText
            value={book.name}
            name="name"
            error={(form?.errors?.name ?? [undefined])[0]}
          />
          <InputText value={book.author} name="author" error={authorError} />

          <InputAny
            name="dateStarted"
          >
            <div class="icon-wrapper" slot="label">
              <span class="w-5 block" title="date started">
                <EventProgress />
              </span>
              Date started:
            </div>

            <DateSelector
              slot="input"
              id="dateStarted"
              name="dateStarted"
              inputClassName="!w-full !input"
              className="w-full"
              datetime={book.dateStarted ?? DEFAULT_OPTIONAL_DATETIME}
            />
          </InputAny>

          <InputAny
            name="dateFinished"
          >
            <div class="icon-wrapper" slot="label">
              <span class="w-5 block" title="date read">
                <EventDone />
              </span>
              Date read:
            </div>

            <DateSelector
              id="dateFinished"
              name="dateFinished"
              inputClassName="!w-full !input"
              className="w-full"
              slot="input"
              datetime={book.dateFinished ?? DEFAULT_OPTIONAL_DATETIME}
            />
          </InputAny>

          <!-- <InputSelect
            value={book.yearRead}
            displayName="Read in (year)"
            name={"year"}
            error={(form?.errors?.year ?? [undefined])[0]}
          >
            {#each range(startDate, endDate) as year}
              <option value={year}>
                {year}
              </option>
            {/each}
          </InputSelect> -->

          <InputSelect
            value={book.bookListName}
            displayName="List"
            name={"listName"}
            error={listNameError}
          >
            {#each bookLists as list}
              <option value={list.name}>
                {list.name}
              </option>
            {/each}
          </InputSelect>
        </div>

        <BookApiDataEdit data={book.bookApiData} />

        <div class="my-7">
          {#if book.rating !== null}
            <div class="flex gap-2 items-center mb-1">
              <h2 class="text-xl">Rating</h2>
              <div>
                (<input
                  class="max-w-[3.5rem] p-0 text-center"
                  name="stars"
                  type="number"
                  step="0.5"
                  bind:value={book.rating.stars}
                  min="0"
                  max={MAX_RATING}
                />
                / {MAX_RATING})
              </div>
            </div>
            <Rating
              bind:rating={book.rating.stars}
              rating_max={MAX_RATING}
              editable={true}
            />

            <section>
              <h2 class="text-xl mt-5">Comment</h2>
              <div class="w-full">
                <textarea
                  class="w-full input"
                  name="comment"
                  id="comment"
                  bind:value={book.rating.comment}
                  rows="10"
                />
              </div>
            </section>
          {/if}
          <section>
            <h2 class="text-xl mt-5">Series</h2>
            <span class="text-base text-slate-500"
              >Don't forget to press the big blue save button</span
            >
            <div class="mt-2 flex gap-2 w-full">
              <input
                type="hidden"
                name="bookSeriesId"
                value={book.bookSeriesId}
              />
              <AutoComplete
                items={books.filter((b) => b.name != book.name)}
                labelFunction={autoCompleteBookLabel}
                bind:selectedItem={selectedSeriesBook}
                class="input dark:bg-slate-600 dark:border-slate-500 w-full"
              />
              <button
                title="Add book"
                aria-label="Add book to book series"
                type="button"
                class="btn-primary-black px-1 py-1"
                on:click={addBookSeries}
              >
                <span class="block w-[30px]">
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
                allow_deletion={true}
              />
            </div>
          </section>

          <section>
            <InputNumber
              value={book.wordsPerPage}
              name="wordsPerPage"
              displayName="Words per page estimate"
              error={wordsPerPageError}
            />
          </section>

          <div class="min-[500px]:flex min-[500px]:justify-end">
            <button
              formaction="?/save"
              class="bg-blue-700 text-white py-3 px-4 my-4 rounded-md w-full
            block sm:hidden min-[500px]:w-1/2"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    {/if}
  </form>
</div>

<BookDeletePopUp
  deletionBook={book}
  bind:openModal={open_delete}
  on:success={() => goto("/")}
/>

<style>
  :global(.autocomplete) {
    width: 100%;
  }
</style>
