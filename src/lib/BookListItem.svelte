<script context="module" lang="ts">
  export type ItemDeleteEvent = { book: BookRating };
</script>

<script lang="ts">
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import { page } from "$app/stores";
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
  import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";
  import type { BookRating } from "../app";
  import type { Book } from "@prisma/client";
  import { createEventDispatcher } from "svelte";

  export let book: BookRating;
  // export let deletionBook: Book | undefined = undefined;
  // export let openModal: boolean = false;
  export let allow_deletion: boolean | undefined = true;

  const dispatch = createEventDispatcher<{ delete: ItemDeleteEvent }>();
  // console.log(book);

  const book_url = encodeURIComponent(book.name);

  let maxRating = 5;

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
</script>

<div
  class="rounded-md dark:bg-slate-700 dark:border-slate-600 border mb-3 p-2 items-center
    hover:border-gray-300 dark:hover:border-slate-500 w-full
    grid gap-2"
  style="grid-template-columns: 4px 1fr;"
>
  <div
    class="min-h-10 min-w-1 w-1 basis-1 flex-shrink-0 {getColor(
      book.name,
      book.author
    )} rounded-md"
    style="height: 98%;"
  />
  <div
    class="book-item-grid {book.rating
      ? 'sm:grid-cols-5 grid-cols-3'
      : 'sm:grid-cols-4 grid-cols-2'}"
  >
    <div
      class="flex justify-center item flex-col h-full col-span-full sm:col-span-1 max-h-36"
    >
      <a
        href="/book/{book_url}"
        class="text-md underline-hover
      text-ellipsis overflow-hidden">{book.name}</a
      >
    </div>
    <div class="col-span-full sm:col-span-1 -mt-2 sm:mt-0">
      <p class="text-gray-600 dark:text-slate-300">{book.author}</p>
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
          class="inline-flex flex-row divide-x overflow-hidden rounded-md border bg-white shadow-sm
          dark:bg-slate-600 dark:border-slate-700"
        >
          <a
            class="group inline-block p-2 hover:bg-gray-50 focus:relative
            dark:hover:bg-slate-500"
            title="Edit book"
            href="/book/{book_url}/?edit=true"
          >
            <span
              class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
            >
              <IoMdSettings />
            </span>
          </a>

          <slot name="delete">
            {#if allow_deletion}
              <button
                class="group p-2 delete-button"
                title="Delete book"
                type="button"
                on:click={() => {
                  dispatch("delete", { book });
                }}
              >
                <span
                  class="block icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"
                >
                  <IoMdTrash />
                </span>
              </button>
            {/if}
          </slot>
        </span>
      </div>
    {:else}
      <div class="flex justify-end">
        <a class="underline-hover" href="/book/{book_url}">View</a>
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .icon {
    width: 20px;
    height: 20px;
  }
  .icon-edit {
    width: 20px;
    height: 20px;
  }

  .book-item-grid {
    display: grid;
    flex-grow: 1;
    grid-template-rows: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    row-gap: 0;
    align-items: center;
    height: 100%;
    grid-template-rows: auto;
  }

  @media (min-width: 640px) {
    .book-item-grid {
      grid-template-rows: repeat(1, minmax(0, 1fr));
    }
  }

  .delete-button {
    @apply hover:bg-red-200 focus:relative bg-red-100 text-red-600
            dark:bg-red-500 dark:border-red-500 dark:hover:bg-red-400 dark:hover:border-red-400
            dark:text-red-200
            hidden sm:inline-block;
  }
</style>
