<script lang="ts">
  import Rating from "./../../../lib/Rating.svelte";
  import type { Book, Prisma } from "@prisma/client";
  import { space } from "svelte/internal";
  import { page } from "$app/stores";

  export let data: any;

  type BookWithRating = Prisma.BookGetPayload<{
    include: {
      rating: true;
    };
  }>;
  let book: BookWithRating = data.book;

  let edit = false;
  let max_rating = 5;

  let rating = book.rating ?? { stars: 0, comment: "" };
  let rating_stars = rating.stars;
  let rating_comment = rating.comment;
</script>

<div class="py-3">
  <form class="flex justify-between" method="POST">
    {#if !edit}
      <div>
        <h1 class="text-4xl">{book.name}</h1>
        <div>
          <p class="text-gray-600">Author: {book.author}</p>
          <p class="text-gray-600">Read in (month): {book.monthRead ?? "-"}</p>
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
        <h1 class="text-4xl">{book.name}</h1>
        <div class="grid grid-cols-2">
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
            <input
              id="month"
              name="month"
              type="text"
              class="border"
              bind:value={book.monthRead}
            />
        </div>

        <div class="my-7">
          <div class="flex gap-2 items-center">
            <h2 class="text-xl">Rating</h2>
            <div>
              (<input
                class="max-w-[2rem]"
                name="stars"
                type="number"
                bind:value={rating_stars}
                min="0"
                max={max_rating}
              />/{max_rating})
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

    {#if $page.data.session}
      <div class="flex flex-col gap-1">
        <input type="hidden" name="id" value={book.id} />
        <button
          type="button"
          class="border hover:border-blue-500"
          on:click={() => {
            edit = !edit;
          }}>edit</button
        >
        <button formaction="?/delete" class="border hover:border-red-500"
          >delete</button
        >
        {#if edit}
          <button formaction="?/save"> Save </button>
        {/if}
      </div>
    {/if}
  </form>
</div>
