<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import { fade, scale } from "svelte/transition";
  import BookSearch from "../BookSearch.svelte";
  //@ts-ignore
  import IoMdDoneAll from "svelte-icons/io/IoMdDoneAll.svelte";
  import type { BookFullType, BookListItemType } from "$appTypes";
  import { createSearchStore, searchHandler } from "$lib/stores/search";
  import type { Book } from "@prisma/client";
  import { onDestroy, onMount } from "svelte";
  import { flip } from "svelte/animate";
  import type { ItemDeleteEvent } from "./BookListItem.svelte";
  import BookListItem from "./BookListItem.svelte";
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";

  export let books: BookListItemType[];

  const sentences = [
    "Add a book, mate!",
    "Books, my friend. Get some!",
    "Ain't no books here, add one!",
    "Hey, your shelf's empty. Add a book!",
    "Don't leave that shelf empty, pal. Add a book!",
    "Books are calling, boi. Add one!",
    "C'mon, your next read's waiting!",
    "Get some books, friend. It’s time!",
    "Hey, your library’s looking lonely. Add a book!",
    "Come on, start reading!",
  ];
  let randomSentence = "";
  onMount(() => {
    randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
  });
</script>

<div class="flex justify-between mt-8 mb-2 sm:flex-row flex-col">
  <h2 class="flex items-end text-2xl -mb-1">
    Currently Reading ({books.length})
  </h2>
</div>

{#if books.length < 1 && $page.data.session}
  <p class="text-center text-4xl rotate-90">:(</p>
  <p class="text-center text-gray-600 dark:text-slate-300 min-h-8">
    {randomSentence}
  </p>
{/if}

<div class="dark:bg-slate-800 bg-white">
  {#each books as book (book.id)}
    <form action={`book/${book.name}?/save`} method="POST" use:enhance>
      <input type="hidden" name="id" value={book.id} />

      <input type="hidden" name="listName" value="Read" />
      <input type="hidden" name="name" value={book.name} />
      <input type="hidden" name="author" value={book.author} />

      <BookListItem {book}>
        <button
          class="group p-2 !border-0 done-button"
          title="done reading"
          type="submit"
          slot="delete"
          on:click={() => {}}
        >
          <span
            class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click"
          >
            <IoMdDoneAll alt="check mark" />
          </span>
        </button>
      </BookListItem>
    </form>
  {/each}
</div>

<style lang="postcss">
  .done-button {
    @apply hover:bg-green-300 focus:relative bg-green-200 text-green-600
              dark:bg-green-600 dark:hover:bg-green-500
              dark:text-green-200
              hidden sm:inline-block;
  }
</style>
