<script lang="ts">
  import BookApiData from "./../../../lib/Book/BookApiData.svelte";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import AutoComplete from "simple-svelte-autocomplete";
  import Rating from "./../../../lib/Rating.svelte";
  import type { BookList, Prisma } from "@prisma/client";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import InputText from "$lib/InputText.svelte";
  import InputSelect from "$lib/InputSelect.svelte";
  import IoIosAdd from "svelte-icons/io/IoIosAdd.svelte";
  import type { ActionData, PageData } from "./$types";
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import InputNumber from "$lib/InputNumber.svelte";
  import type { BookFullType, BookRating } from "../../../app";
  import BookListSeries from "$lib/BookList/BookListSeries.svelte";
  import BookListSimple from "$lib/BookList/BookListSimple.svelte";
  import BookApiDataEdit from "$lib/Book/BookApiDataEdit.svelte";

  export let data: PageData;

  type BookAll = Prisma.BookGetPayload<{
    include: {
      rating: true;
      bookSeries: {
        include: {
          books: {
            include: {
              rating: true;
            };
          };
        };
      };
      bookApiData: {
        include: {
          categories: true;
        };
      };
    };
  }>;

  // let book: BookAll;
  let book: BookAll = data.book;
  let books: BookRating[] = data.books;

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
  }

  // console.log(data.book.bookSeries?.books);

  let bookLists: BookList[];

  $: bookLists = data.bookLists;

  let selectedSeriesBook: BookRating;

  let max_rating = 5;

  // $: rating = book?.rating ?? { stars: 0, comment: "" };
  // $: rating_stars = rating.stars;
  // $: rating_comment = rating.comment;

  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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
  const on_delete = (b: BookRating) => {
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
</script>

<svelte:head>
  <title>{book.name}</title>
</svelte:head>

<div class="mt-5">
  <form method="POST" id="form-book">
    <div class="flex justify-between flex-col-reverse sm:flex-row mb-2 sm:mb-0">
      <h1 class="text-4xl overflow-hidden text-ellipsis">{book.name}</h1>

      {#if $page.data.session}
        <div class="flex justify-center mb-2 sm:mb-0">
          <input type="hidden" name="id" value={book.id} />

          <div class="sm:flex sm:flex-col sm:gap-1">
            <span
              class="btn-group mb-2 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-slate-500"
            >
              <button
                class="btn-group-btn
              dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 dark:text-white"
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
                  formaction="?/save"
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
    </div>

    {#if !edit}
      <div>
        <div class="attribute-stats">
          <p>Author: {book.author}</p>
          <p>
            Read in (month): {book.monthRead ?? "-"}
          </p>
          <p>
            Read in (year): {book.yearRead ?? "-"}
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
              <p>({book.rating.stars}/{max_rating})</p>
            </section>
            <Rating rating={book.rating.stars} rating_max={max_rating} />

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
          <InputText
            value={book.author}
            name="author"
            error={(form?.errors?.author ?? [undefined])[0]}
          />
          <InputSelect
            value={book.monthRead}
            displayName="Read in (month)"
            name={"month"}
            error={(form?.errors?.month ?? [undefined])[0]}
          >
            {#each Array(12) as _, month}
              <option value={month + 1}>
                {months[month]}
              </option>
            {/each}
          </InputSelect>

          <InputNumber
            value={book.yearRead}
            name="year"
            displayName="Read in (year)"
            error={(form?.errors?.year ?? [undefined])[0]}
          />

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
            error={(form?.errors?.listName ?? [undefined])[0]}
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
                  max={max_rating}
                />
                / {max_rating})
              </div>
            </div>
            <Rating
              bind:rating={book.rating.stars}
              rating_max={5}
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
