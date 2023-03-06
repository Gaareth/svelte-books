<script lang="ts">
  import Rating from "./../../../lib/Rating.svelte";
  import type { BookList, Prisma } from "@prisma/client";
  import { page } from "$app/stores";
  import Popup from "$lib/Popup.svelte";

  export let data: any;
  let edit: boolean = data.edit !== "false" && data.edit !== null;

  type BookAll = Prisma.BookGetPayload<{
    include: {
      rating: true;
      bookList: true;
      bookListName: true;
    };
  }>;
  let book: BookAll = data.book;

  let bookLists: BookList[] = data.bookLists;

  let max_rating = 5;

  let rating = book.rating ?? { stars: 0, comment: "" };
  let rating_stars = rating.stars;
  let rating_comment = rating.comment;

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

  function range(start: number, end: number) {
    var list = [];
    for (var i = start; i <= end; i++) {
      list.push(i);
    }
    return list;
  }

  let startDate = 1900;
  let endDate = new Date().getFullYear() + 100;

  let open_delete = false;

</script>

<div class="py-3">
  <form method="POST" use:enhance>
    <div class="flex justify-between">
      <h1 class="text-4xl">{book.name}</h1>

      {#if $page.data.session}
        <input type="hidden" name="id" value={book.id} />

        <div class="flex flex-col gap-1">
          <span class="btn-group mb-2 ">
            <button
              class="btn-group-btn"
              type="button"
              on:click={() => {
                edit = !edit;
              }}
            >
              {edit ? "Cancel" : "Edit"}
            </button>
            {#if edit}
              <button formaction="?/save" class="btn-group-btn text-blue-700">
                Save
              </button>
            {/if}
            <button formaction="?/delete" class="text-red-700 btn-group-btn">
              Delete
            </button>
          </span>
        </div>
      {/if}
    </div>

    {#if !edit}
      <div>
        <div>
          <p class="text-gray-600">Author: {book.author}</p>
          <p class="text-gray-600">Read in (month): {book.monthRead ?? "-"}</p>
          <p class="text-gray-600">Read in (year): {book.yearRead ?? "-"}</p>
        </div>

        <div class="my-7">
          {#if book.rating}
            <div class="flex gap-2 items-center">
              <h2 class="text-xl">Rating</h2>
              <p>({book.rating.stars}/{max_rating})</p>
            </div>
            <Rating rating={book.rating.stars} rating_max={max_rating} />

            {#if book.rating.comment && book.rating.comment.length > 0}
              <div class="py-2 my-2">
                <h3 class="text-xl">Comment</h3>
                <p>{book.rating.comment}</p>
              </div>
            {:else if $page.data.session}
              <button class="mt-5" on:click={() => (edit = !edit)}
                >Add a comment?</button
              >
            {/if}
          {:else}
            <h2>No rating...</h2>
          {/if}
        </div>
      </div>
    {:else}
      <div class="w-full">
        <div class="grid grid-cols-2 items-center">
          <label for="name">Name:</label>
          <input
            id="name"
            name="name"
            type="text"
            class="border"
            bind:value={book.name}
          />
          <label for="author">Author:</label>
          <input
            id="author"
            name="author"
            type="text"
            class="border"
            bind:value={book.author}
          />
          <label for="month">Read in (month):</label>
          <select bind:value={book.monthRead} name="month" id="month">
            {#each Array(12) as _, month}
              <option value={month + 1}>
                {months[month]}
              </option>
            {/each}
          </select>

          <label for="year">Read in (year):</label>
          <select bind:value={book.yearRead} name="year" id="year">
            {#each range(startDate, endDate) as year}
              <option value={year}>
                {year}
              </option>
            {/each}
          </select>

          <label for="listName">List:</label>
          <select bind:value={book.bookListName} name="listName" id="listName">
            {#each bookLists as list}
              <option value={list.name}>
                {list.name}
              </option>
            {/each}
          </select>
        </div>

        <div class="my-7">
          <div class="flex gap-2 items-center">
            <h2 class="text-xl">Rating</h2>
            <div>
              (<input
                class="max-w-[2.5rem] p-0 text-center"
                name="stars"
                type="number"
                bind:value={rating_stars}
                min="0"
                max={max_rating}
              />
              / {max_rating})
            </div>
          </div>
          <Rating rating={rating_stars} rating_max={5} />

          <div class="border rounded p-2 my-2 w-full">
            <textarea
              class="w-full"
              name="comment"
              id="comment"
              bind:value={rating_comment}
              rows="10"
            />
          </div>
        </div>
      </div>
    {/if}
  </form>
</div>

<Popup
  showModal={true}
  message={"Delete book: " + book.name + "?"}
  content={"You won't be able to restore this book, unless you create a new one"}
  btn1_msg={"Delete book"}
  btn2_msg={"cancel" }
  type={"Error"}
  on:primary={}
/>
