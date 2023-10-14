<script lang="ts">
  import type { BookApiDataCategories, queriedBookFull } from "$appTypes";
  import BookApiConfirm from "$lib/BookApiSelection/BookApiConfirm.svelte";
  import BookApi from "./../BookApiSelection/BookApi.svelte";
  export let data: BookApiDataCategories | null;
  let newVolumeId: string | undefined;
  let bookSelected: boolean;
  // let fetch_data = data;

  let queriedBook: queriedBookFull;
  if (data !== null) {
    queriedBook = {
      id: data.id,
      volumeInfo: {
        ...data,
        subtitle: data.subtitle || undefined,
        authors: data.authors.split("|"),
        publishedDate: data.publishedDate || undefined,
        publisher: data.publisher || undefined,
        industryIdentifiers: [
          {
            type: "ISBN_13",
            identifier: data.isbn_13 ?? undefined,
          },
        ],
        imageLinks:
          data.thumbnailUrl !== null
            ? {
                smallThumbnail: data.thumbnailUrl,
                thumbnail: data.thumbnailUrl,
              }
            : undefined,
        printedPageCount: undefined,
        pageCount: data.pageCount || undefined,
        categories: data.categories.map((c) => c.name),
      },
    };
  }

  let currentBookData: Promise<queriedBookFull> = new Promise(
    (resolve, reject) => {
      resolve(queriedBook);
    }
  );

  const reloadData = async () => {
    currentBookData = (await fetch(`/book/api/get/${data?.id}`)).json();
    bookSelected = true;
    newVolumeId = data?.id;
  };
</script>

<section class="my-10">
  <h2 class="text-xl flex items-center gap-1">
    API Data
    <a href="https://books.google.com/books" class="text-sm underline"
      >(Google Books)</a
    >
    {#if data !== null}
      <button type="button" class="btn-generic ml-auto" on:click={reloadData}>
        <span class="w-4 h-4">
          <!-- <IoIosRefresh /> -->
        </span>
        reload
      </button>
    {/if}
  </h2>
  {#if data !== null}
    <p class="text-sm text-slate-500 -mb-2">Current data:</p>
    <BookApiConfirm
      volumeId={data.id}
      getBookPromise={currentBookData}
      back_button={false}
    />
  {/if}
  {#if bookSelected}
    <input type="hidden" name="apiVolumeId" value={newVolumeId} />
    <p class="text-base text-slate-500 text-center mt-3">
      <span class="text-base text-stone-950 dark:text-gray-200"
        >Unsaved changes!
      </span>Don't forget to press the big
      <span class="text-blue-700 text-base">blue</span> save button
    </p>
  {/if}

  <BookApi
    open={false}
    bind:volumeId={newVolumeId}
    summary_text={data !== null ? "Update API connection" : undefined}
    on:select={() => (bookSelected = true)}
    on:back={() => (bookSelected = false)}
  />
</section>
