<script lang="ts">
  import BookDeletePopUp from "$lib/BookDeletePopUp.svelte";
  import { page } from "$app/stores";
  import type { Book, Prisma } from "@prisma/client";
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
  import IoMdSettings from "svelte-icons/io/IoMdSettings.svelte";
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";
  import { goto, invalidateAll } from "$app/navigation";

  type BookFullType = Prisma.BookGetPayload<{
    select: { [K in keyof Required<Prisma.BookSelect>]: true };
  }>;

  export let books: BookFullType[];
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
    const hash = hashCode(name+author);    
    let index = hash % (colors.length);
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

<h2 class="mt-8">Books</h2>
{#if books.length <= 0}
  <p>No books added at the moment :(</p>
  <!-- {#if $page.data.session}
     <button on:click={() => add}>add some</button>
  {/if} -->
{/if}
{#each books as book}
  <div
    class="rounded-md dark:bg-slate-700 dark:border-slate-600 border mb-3 p-2 items-center 
    grid {book.rating ? 'grid-cols-5' : 'grid-cols-4'} "
  >
    <div class="flex items-center">
      <div class="h-10 w-1 {getColor(book.name, book.author)} rounded-md mr-2" />

      <a href="/book/{book.name}" class="text-md underline-hover">{book.name}</a
      >
    </div>
    <div>
      <p class="text-gray-600 dark:text-slate-400">{book.author}</p>
    </div>

    <div class="mr-1 sm:mr-0">
      <p>
        {book.yearRead ?? "?"} / {book.monthRead ? "0" + book.monthRead : "?"}
      </p>
    </div>

    {#if book.rating}
      <div class="flex sm:gap-2 gap-1 items-center">
        <p>{book.rating.stars} / {maxRating}</p>
        <div class="icon"><IoIosStar /></div>
      </div>
    {/if}

    {#if $page.data.session}
      <div class="flex justify-end">
        <span
          class="inline-flex sm:flex-row flex-col divide-x overflow-hidden rounded-md border bg-white shadow-sm
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
            class="group inline-block p-2  hover:bg-red-200 focus:relative bg-red-100 text-red-600
            dark:bg-red-500 dark:border-red-500 dark:hover:bg-red-400 dark:hover:border-red-400 
            dark:text-red-200"
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
