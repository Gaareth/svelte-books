<script lang="ts">
    import type { BookApiDataCategories, queriedBookFull } from "$appTypes";

    import BookApi from "$components/composed/BookApiSelection/BookApi.svelte";
    import BookApiConfirm from "$components/composed/BookApiSelection/BookApiConfirm.svelte";

    interface Props {
        query?: string | undefined;
        data: BookApiDataCategories | null;
        onTakeOver?: (event: {
            volumeId: string | undefined;
            queriedBook: queriedBookFull | undefined;
        }) => void;
    }

    let { query = undefined, data, onTakeOver }: Props = $props();

    let newVolumeId: string | undefined = $state();
    let bookSelected: boolean = $state(false);

    let queriedBook: queriedBookFull | undefined = $derived(
        data
            ? {
                  id: data.id,
                  volumeInfo: {
                      ...data,
                      description: data.description || undefined,
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
              }
            : undefined,
    );

    let currentBookData = $state<Promise<queriedBookFull>>(
        Promise.resolve(null as unknown as queriedBookFull),
    );

    $effect(() => {
        if (queriedBook) {
            currentBookData = Promise.resolve(queriedBook);
        }
    });

    let newBookData = $state<Promise<queriedBookFull>>(
        Promise.resolve(null as unknown as queriedBookFull),
    );

    const reloadData = async () => {
        if (data === null) return;

        currentBookData = (await fetch(`/book/api/get/${data.id}`)).json();
        bookSelected = true;
        newVolumeId = data.id;
    };

    const takeOver = () => {
        newBookData.then((book) => {
            console.log("takeOver", book);
            onTakeOver?.({
                volumeId: newVolumeId,
                queriedBook: book,
            });
        });
    };
</script>

<section class="my-10">
    <h2 class="text-xl flex items-center gap-1">
        API Data
        <a href="https://books.google.com/books" class="text-sm underline">
            (Google Books)
        </a>

        {#if data !== null}
            <div class="ml-auto">
                <button type="button" class="btn-generic" onclick={reloadData}>
                    <span class="w-4 h-4">
                        <!-- refresh icon -->
                    </span>
                    reload
                </button>

                <button type="button" class="btn-generic" onclick={takeOver}>
                    Take over
                </button>
            </div>
        {/if}
    </h2>

    {#if data !== null}
        <p class="text-sm text-secondary -mb-2">Current data:</p>

        <BookApiConfirm
            volumeId={data.id}
            getBookPromise={currentBookData}
            back_button={false} />
    {/if}

    {#if bookSelected}
        <input type="hidden" name="apiVolumeId" value={newVolumeId} />

        <p class="text-base text-slate-500 text-center mt-3">
            <span class="text-base text-stone-950 dark:text-gray-200">
                Potentially unsaved changes!
            </span>
            Don't forget to press the big
            <span class="text-blue-700 text-base">blue</span>
            save button
        </p>
    {/if}

    <BookApi
        {query}
        label={data !== null ? "Update Book API" : "Add Book API"}
        bind:volumeId={newVolumeId}
        bind:getBookPromise={newBookData}
        onSelectClicked={() => (bookSelected = true)}
        onBackClicked={() => (bookSelected = false)} />
</section>
