<script lang="ts">
    import type { BookApiDataCategories, queriedBookFull } from "$appTypes";

    import BookApi from "$components/composed/BookApiSelection/BookApi.svelte";
    import BookApiConfirm from "$components/composed/BookApiSelection/BookApiConfirm.svelte";
    import Alert from "../../Alert.svelte";

    interface Props {
        query?: string | undefined;
        data: BookApiDataCategories | null;
        onTakeOver?: (event: {
            queriedBook: queriedBookFull | undefined;
        }) => void;
    }
    let { query, data, onTakeOver }: Props = $props();

    let newVolumeId: string | undefined = $state();
    let bookSelected = $state(false);

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

    let currentBookData: Promise<queriedBookFull> | undefined = $state();

    let newBookData: Promise<queriedBookFull> | undefined = $state();

    $effect(() => {
        if (queriedBook) {
            currentBookData = Promise.resolve(queriedBook);
        }
    });

    const reloadData = async () => {
        if (!data) return;

        currentBookData = fetch(`/book/api/get/${data.id}`).then((res) =>
            res.json(),
        );

        bookSelected = true;
        newVolumeId = data.id;
    };

    const takeOver = async () => {
        const book = await (newBookData ?? currentBookData);

        if (!book) return;

        console.log("takeOver", book);

        onTakeOver?.({
            queriedBook: book,
        });
    };
</script>

<section class="my-10">
    <div class="text-xl flex items-center gap-1 mb-2">
        <h2>
            API Data
            <a href="https://books.google.com/books" class="text-sm underline">
                (Google Books)
            </a>
            <p class="text-base text-secondary -mt-1">
                You can reload/refresh the data from google or take it over and
                overwrite title, cover, etc.
            </p>
        </h2>

        {#if data !== null}
            <div class="ml-auto">
                <button type="button" class="btn-generic" onclick={reloadData}>
                    <span class="w-4 h-4">
                        <!-- refresh icon -->
                    </span>
                    Reload
                </button>

                <button type="button" class="btn-generic" onclick={takeOver}>
                    Take over
                </button>
            </div>
        {/if}
    </div>

    {#if data !== null}
        <p class="text-sm text-secondary -mb-2">Current data:</p>

        <BookApiConfirm
            volumeId={data.id}
            getBookPromise={currentBookData}
            back_button={false} />
    {/if}

    {#if bookSelected}
        <input type="hidden" name="apiVolumeId" value={newVolumeId} />

        <Alert type="info" className="text-center mt-3">
            <span class="text-base text-stone-950 dark:text-gray-200">
                Potentially unsaved changes.
            </span>
            Don't forget to press the "Save" button
        </Alert>
    {/if}

    <BookApi
        {query}
        label={data !== null ? "Update Book API" : "Add Book API"}
        bind:volumeId={newVolumeId}
        bind:getBookPromise={newBookData}
        onSelectClicked={() => (bookSelected = true)}
        onBackClicked={() => (bookSelected = false)} />
</section>
