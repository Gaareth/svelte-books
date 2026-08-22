<script lang="ts">
    import clsx from "clsx";

    import { getMaxResolutionImage } from "$src/lib/utils/utils";
    import AddImageIcon from "$src/lib/icons/AddImageIcon.svelte";
    import Modal from "../../Modal.svelte";
    import BookApi from "../BookApiSelection/BookApi.svelte";
    import TabGroup from "../Tab/TabGroup.svelte";
    import TabPanel from "../Tab/TabPanel.svelte";
    import TabPanels from "../Tab/TabPanels.svelte";
    import { resolve } from "$app/paths";
    import { publicConfig } from "$src/lib/config/public";
    import CoverImage, { hasCoverImage } from "./CoverImage.svelte";
    import type { BookWithImage } from "$src/app";

    interface Props {
        edit: boolean | undefined;
        book: BookWithImage;
    }

    let { edit, book }: Props = $props();

    //lg:group-hover:opacity-50
    const imageSizeClass =
        "max-w-full h-[300px] sm:w-[320px] sm:h-[330px] lg:w-[199px] aspect-[2/3]";

    const imageClass =
        clsx(`transition-all duration-300 relative text-transparent
      ${imageSizeClass} object-cover object-center rounded`);

    let showChooseCoverImageModal = $state(false);
    let selectedVolumeId: string | undefined = $state();

    let hasImage: boolean | undefined = $derived(hasCoverImage(book));
</script>

<div class={clsx("lg:item-border-no-hover lg:p-4 relative", edit && "group")}>
    <div class="flex flex-col justify-center relative">
        {#if hasImage}
            <div
                class="h-[300px] sm:h-[400px] w-full mb-10 dark:lg:hidden dark:block">
            </div>

            <div class=" absolute inset-0 w-full">
                <CoverImage
                    {book}
                    wrapperClass="!overflow-visible"
                    class="hidden aspect-[390/321] blur-[28px] w-screen sm:h-[400px] h-[330px] rounded object-cover object-center -z-10 dark:lg:hidden dark:block"
                    backgroundClass="blur-[48px]"
                    alt="book cover blurred"
                    aria-hidden="true" />

                <CoverImage
                    {book}
                    wrapperClass="!overflow-visible"
                    class={clsx(
                        "hidden blur-[20px] h-[330px] rounded object-cover object-center dark:lg:block",
                    )}
                    backgroundClass="blur-[20px]"
                    alt="book cover blurred"
                    aria-hidden="true" />
            </div>
        {/if}
        <div
            class={clsx(
                hasImage &&
                    "absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0",
                !hasImage &&
                    "flex justify-center items-center",
            )}>
            <CoverImage
                {book}
                wrapperClass={imageSizeClass}
                class={imageClass} />
        </div>

        {#if edit}
            <div
                class="block lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button
                    onclick={() => (showChooseCoverImageModal = true)}
                    type="button"
                    class="btn-generic btn-generic-color-2 flex items-center gap-1">
                    Change <AddImageIcon />
                </button>
            </div>
        {/if}
    </div>

    {#if edit}
        <div class="hidden lg:flex justify-center my-4">
            <button
                onclick={() => (showChooseCoverImageModal = true)}
                type="button"
                class="btn-generic btn-generic-color-2 w-full flex items-center gap-1">
                Choose or upload
                <AddImageIcon />
            </button>
        </div>
    {/if}

    <div class="hidden mt-3 text-secondary lg:flex flex-col">
        <span class="text-base leading-tight">
            Publisher: {book.bookApiData?.publisher ?? "Unknown"}
        </span>
        <span class="text-base leading-tight">
            ISBN: {book.bookApiData?.isbn_13 ?? "Unknown"}
        </span>
        <span class="text-base leading-tight">
            Language: {book.bookApiData?.language ?? "Unknown"}
        </span>
    </div>
</div>

<Modal
    bind:showModal={showChooseCoverImageModal}
    divClassName="w-full"
    className="w-[95%] lg:w-2/5">
    {#snippet header()}
        <div class="flex items-center gap-4 w-full">
            <p class="font-medium">Choose a book cover</p>
        </div>
    {/snippet}

    <p class="mt-3 text-secondary">
        Make sure to choose a high-quality image for the best results.
    </p>

    <TabGroup
        className="my-5"
        tabTriggerWrapperClass="grid grid-cols-2 gap-1 w-full"
        btnClass="px-4 py-1 dark:hover:border-slate-400 text-slate-600 hover:text-slate-700 
        dark:text-slate-400 dark:hover:text-slate-100"
        btnSelectedClass="dark:text-slate-100 text-slate-900"
        sliderClass="border-b-2 border-indigo-400"
        tabNames={["choose from google books", "upload own image"]}
        animate={false}>
        <TabPanels className="">
            <TabPanel className="px-0.5">
                <!-- TODO: only show results where image exists -->
                {#if selectedVolumeId != null}
                    <input
                        form="form-book"
                        type="hidden"
                        name="googleBooksCoverVolumeId"
                        value={selectedVolumeId} />
                {/if}
                <BookApi
                    label="Search using google books"
                    bind:volumeId={selectedVolumeId}
                    onBackClicked={() => (selectedVolumeId = undefined)}
                    searchEntriesWrapperClass="flex flex-wrap mt-5 gap-1">
                    {#snippet APIResult(book)}
                        {@const coverImage = getMaxResolutionImage(
                            JSON.stringify(book.volumeInfo.imageLinks),
                        )}
                        <p>
                            You have selected the following image from Google
                            Books:
                        </p>
                        <div class="flex justify-center mt-2 w-full">
                            <img
                                src={coverImage
                                    ? resolve(
                                          `/api/book-covers?url=${encodeURIComponent(coverImage)}`,
                                      )
                                    : "/cover.png"}
                                alt={`${!coverImage ? "Placeholder " : ""}cover`}
                                class="w-48 sm:w-56 md:w-64 lg:w-72 aspect-[1/1.5] rounded-md" />
                        </div>
                        <!-- TODO: show image quality and dimensions -->
                    {/snippet}

                    {#snippet ResultEntry(book, selectedBookId, onSelect)}
                        {@const coverImage = getMaxResolutionImage(
                            JSON.stringify(book.volumeInfo?.imageLinks),
                        )}
                        <button
                            type="button"
                            class="hover:opacity-70"
                            class:ring-2={selectedBookId === book.id}
                            onclick={() => onSelect(book.id)}>
                            <img
                                src={coverImage
                                    ? resolve(
                                          `/api/book-covers?url=${encodeURIComponent(coverImage)}`,
                                      )
                                    : "/cover.png"}
                                alt={`${!coverImage ? "Placeholder " : ""}cover`}
                                class="w-32 aspect-[1/1.5] rounded-md" />
                        </button>
                    {/snippet}
                </BookApi>
            </TabPanel>

            <TabPanel className="px-0.5">
                <div class="my-5 flex flex-col gap-2">
                    <label for="coverImageUpload">Choose a cover image:</label>
                    <input
                        form="form-book"
                        type="file"
                        id="coverImageUpload"
                        name="coverImageUpload"
                        class="input btn-generic-color-2"
                        accept={publicConfig.imageUploads.allowedTypes
                            .map((t) => `image/${t}`)
                            .join(", ")} />

                    <p
                        class="mt-1 text-sm text-gray-500 dark:text-gray-300"
                        id="file_input_help">
                        {publicConfig.imageUploads.allowedTypes
                            .map((t) => t.toUpperCase())
                            .join(", ")} (MAX. {publicConfig.imageUploads
                            .maxFileSize /
                            1024 /
                            1024} MB).
                    </p>
                </div>
            </TabPanel>
        </TabPanels>
    </TabGroup>
</Modal>
