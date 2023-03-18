<script lang="ts">
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import { page } from "$app/stores";
  import type { Book, Prisma } from "@prisma/client";
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
  import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";
  import { goto, invalidateAll } from "$app/navigation";
  import BookSearch from "./BookSearch.svelte";
  import { fade, fly, scale, slide } from "svelte/transition";

  import { createSearchStore, searchHandler } from "$lib/stores/search";
  import { onDestroy } from "svelte";
  import { flip } from "svelte/animate";
  import type { BookFullType } from "../app";

  export let books: BookFullType[];

  const searchStore = createSearchStore(books);
  let added_book = false;

  $: {
    added_book = true;
    $searchStore.data = books;
  }

  const unsubscribe = searchStore.subscribe((model) => searchHandler(model));
  onDestroy(() => {
    unsubscribe();
  });

  let maxRating = 5;

  let name: string;
  let id: string;
  let openModal: boolean = false;

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-lime-500",
    "bg-green-600",
    "bg-emerald-500",
    "bg-teal-600",
    "bg-cyan-400",
    "bg-blue-600",
    "bg-indigo-500",
    "bg-violet-600",
    "bg-fuchsia-600",
    "bg-rose-600",
  ];

  const getColor = (name: string, author: string) => {
    const hash = hashCode(name + author);
    let index = hash % colors.length;
    if (index < 0) {
      index += colors.length;
    }
    return colors[index];
  };

  /**
   * Returns a hash code from a string
   * @param  {String} str The string to hash.
   * @return {Number}    A 32bit integer
   * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
   * @credit https://stackoverflow.com/a/8831937
   */
  function hashCode(str: string) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
      let chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  const animate = (node: any, args: any) => {
    const animation = added_book
      ? scale(node, args)
      : fade(node, { duration: 0, delay: 0 });
    added_book = false;
    return animation;
  };
</script>

<div class="flex justify-between mt-8 mb-2 sm:flex-row flex-col">
  <h2 class="flex items-end text-2xl -mb-1">Books</h2>
  {#if books.length > 0}
    <BookSearch bind:search_term={$searchStore.search} />
  {/if}
</div>

{#if books.length <= 0}
  <p>No books added at the moment :(</p>
{:else if $searchStore.filtered.length <= 0}
  <p>No books found matching your search :(</p>
{/if}

{#each $searchStore.filtered as book (book.id)}
  <div
    class="rounded-md dark:bg-slate-700 dark:border-slate-600 border mb-3 p-2 items-center 
    hover:border-gray-300 dark:hover:border-slate-500 w-full
    grid gap-2
    "
    style="grid-template-columns: 4px 1fr;"
    transition:animate|local={{}}
    animate:flip={{ duration: 300 }}
  >
    <div
      class="min-h-10 min-w-1 w-1 basis-1 flex-shrink-0 {getColor(
        book.name,
        book.author
      )} rounded-md"
      style="height: 98%;"
    />
    <div
      class="grid {book.rating
        ? 'sm:grid-cols-5 grid-cols-4'
        : 'sm:grid-cols-4 grid-cols-3'} grid-rows-2 sm:grid-rows-1
    items-center flex-grow h-full gap-2"
    style="grid-template-rows: auto;"
    >
      <div class="flex justify-center item flex-col h-full col-span-full sm:col-span-1 max-h-36">
        <a
          href="/book/{book.name}"
          class="text-md underline-hover 
      text-ellipsis overflow-hidden">{book.name}</a
        >
      </div>
      <div>
        <p class="text-gray-600 dark:text-slate-400">{book.author}</p>
      </div>

      <div class="flex justify-end ml-5 sm:ml-0">
        <p>
          {book.yearRead ?? "?"} / {book.monthRead ? "0" + book.monthRead : "?"}
        </p>
      </div>

      {#if book.rating}
        <div class="flex sm:gap-2 gap-1 items-center justify-end">
          <p>{book.rating.stars} / {maxRating}</p>
          <div class="icon"><IoIosStar /></div>
        </div>
      {/if}

      {#if $page.data.session}
        <div class="flex justify-end">
          <span
            class="inline-flex flex-row  divide-x overflow-hidden rounded-md border bg-white shadow-sm
          dark:bg-slate-600 dark:border-slate-700"
          >
            <a
              class="group inline-block p-2  hover:bg-gray-50 focus:relative
            dark:hover:bg-slate-500"
              title="Edit book"
              href="/book/{book.name}/?edit=true"
            >
              <div
                class="icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
              >
                <IoMdSettings />
              </div>
            </a>

            <button
              class="group p-2  hover:bg-red-200 focus:relative bg-red-100 text-red-600
            dark:bg-red-500 dark:border-red-500 dark:hover:bg-red-400 dark:hover:border-red-400 
            dark:text-red-200
            hidden sm:inline-block"
              title="Delete book"
              on:click={() => {
                name = book.name;
                id = book.id;
                openModal = true;
              }}
            >
              <div
                class="icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
              >
                <IoMdTrash />
              </div>
            </button>
          </span>
        </div>
      {:else}
        <div class="flex justify-end">
          <a class="underline-hover" href="/book/{book.name}">View</a>
        </div>
      {/if}
    </div>
  </div>
{/each}

<BookDeletePopUp
  {name}
  {id}
  bind:openModal
  on:success={() => {
    openModal = false;
    invalidateAll();
  }}
/>

<style>
  .icon {
    width: 20px;
    height: 20px;
  }
  .icon-edit {
    width: 20px;
    height: 20px;
  }
</style>
