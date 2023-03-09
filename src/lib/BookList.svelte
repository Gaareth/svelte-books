<script lang="ts">
	import BookDeletePopUp from '$lib/BookDeletePopUp.svelte';
  import { page } from "$app/stores";
  import type { Book, Prisma } from "@prisma/client";
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
  import IoMdSettings from 'svelte-icons/io/IoMdSettings.svelte'
  import IoMdTrash from 'svelte-icons/io/IoMdTrash.svelte'
  import { goto, invalidateAll } from '$app/navigation';

  type BookFullType = Prisma.BookGetPayload<{
    select: { [K in keyof Required<Prisma.BookSelect>]: true };
  }>;

  export let books: BookFullType[];
  let maxRating = 5;

  let name: string;
  let id: string;
  let openModal: boolean = false;

</script>

<h2 class="mt-8">Books</h2>
{#if books.length <= 0}
  <p>No books added at the moment :(</p>
  <!-- {#if $page.data.session}
     <button on:click={() => add}>add some</button>
  {/if} -->
{/if}
{#each books as book}
  <div class="rounded border mb-3 p-2 items-center grid {book.rating ? 'grid-cols-5' : 'grid-cols-4'} ">
    <div>
      <a href="/book/{book.name}" class="text-md underline-hover">{book.name}</a
      >
    </div>
    <div>
      <p class="text-gray-600">{book.author}</p>
    </div>

    <div>
      <p>{book.yearRead ?? "?"} / {book.monthRead ? '0' + book.monthRead : '?'}</p>
    </div>

    {#if book.rating}
      <div class="flex gap-2 items-center">
        <p>{book.rating.stars} / {maxRating}</p>
        <div class="icon"><IoIosStar /></div>
      </div>
    {/if}

    {#if $page.data.session}
      <div class="flex justify-end">
        <span
          class="inline-flex divide-x overflow-hidden rounded-md border bg-white shadow-sm"
        >
          <a
            class="group inline-block p-2  hover:bg-gray-50 focus:relative"
            title="Edit book"
            href="/book/{book.name}/?edit=true"
          >
            <div class="icon-edit group-hover:animate-drop-hover group-active:animate-drop-click"><IoMdSettings/></div>
          </a>

          <button
            class="group inline-block p-2  hover:bg-red-200 focus:relative bg-red-100 text-red-600"
            title="Delete book" on:click={() => {
              name = book.name;
              id = book.id;
              openModal = true;
            }}
          >
            <div class="icon-edit group-hover:animate-drop-hover group-active:animate-drop-click">
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

<BookDeletePopUp {name} {id} bind:openModal on:success={() => {
  openModal = false;
  invalidateAll();
}}/>

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
