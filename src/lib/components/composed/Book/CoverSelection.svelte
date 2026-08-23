<script lang="ts">
    import { publicConfig } from "$src/lib/config/public";
    import { getMaxResolutionImage } from "$src/lib/utils/utils";
    import BookApi from "$components/composed/BookApiSelection/BookApi.svelte";
    import TabGroup from "$components/composed/Tab/TabGroup.svelte";
    import TabPanel from "$components/composed/Tab/TabPanel.svelte";
    import TabPanels from "$components/composed/Tab/TabPanels.svelte";
    import ImageUpload from "../../ImageUpload.svelte";
    import type { ImageLinksType } from "$src/app";
    import ImageWithMetadata from "../../ImageWithMetadata.svelte";
    import { resolveAPIImageUrl } from "$src/lib/utils/browserUtils";
    import clsx from "clsx";

    interface Props {
        formId: string;
        selectedGoogleBooksUrl?: string | undefined;
        coverWasSelected?: boolean | undefined;
    }

    let {
        formId,
        selectedGoogleBooksUrl = $bindable(),
        coverWasSelected = $bindable(),
    }: Props = $props();
    let uploadedFile: File | undefined = $state();

    $effect(() => {
        coverWasSelected =
            selectedGoogleBooksUrl != null || uploadedFile != null;
    });

    function discardChanges() {
        selectedGoogleBooksUrl = undefined;
        uploadedFile = undefined;
    }

    function getAllImages(imageLinks: ImageLinksType | undefined) {
        if (!imageLinks) {
            return [];
        }

        const images: { src: string; type: string }[] = [];
        const order: (keyof ImageLinksType)[] = [
            "extraLarge",
            "large",
            "medium",
            "small",
            "thumbnail",
            "smallThumbnail",
        ];

        for (const key of order) {
            const value = imageLinks[key as keyof ImageLinksType];
            if (value) {
                images.push({ src: value, type: key });
            }
        }

        return images;
    }
</script>

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
            <div class="my-5">
                <BookApi
                    label="Search using google books"
                    onBackClicked={() => (selectedGoogleBooksUrl = undefined)}
                    searchEntriesWrapperClass="flex flex-wrap mt-5 gap-1">
                    {#snippet APIResult(book)}
                        {@const imageLinks = getAllImages(
                            book.volumeInfo?.imageLinks,
                        )}

                        <div class="my-3">
                            <p>Select the desired quality/variant:</p>
                            <p class="text-base text-secondary -mt-1">
                                This image will be used as the book cover and
                                for thumbnails.
                            </p>
                        </div>
                        <div
                            class="grid w-full grid-cols-2 md:grid-cols-[repeat(auto-fit,10rem)] justify-center gap-3">
                            {#each imageLinks as imageLink, index (index)}
                                <label class="relative cursor-pointer">
                                    <div
                                        class={clsx(
                                            "flex justify-center rounded-md transition-all hover:-translate-y-0.5 ",
                                            selectedGoogleBooksUrl ===
                                                imageLink.src &&
                                                "ring-2 ring-indigo-400 p-1",
                                        )}>
                                        <ImageWithMetadata
                                            src={imageLink
                                                ? resolveAPIImageUrl(
                                                      imageLink.src,
                                                  )
                                                : "/cover.png"}
                                            alt={`${!imageLink ? "Placeholder " : ""}cover`}
                                            class="w-52 md:w-44 aspect-[1/1.5] rounded-md hover:shadow-md">
                                            {#snippet ImageDataSnippet(
                                                imageData,
                                            )}
                                                <p
                                                    class="text-sm flex flex-wrap items-center gap-1.5 mt-0.5">
                                                    <input
                                                        form={formId}
                                                        type="radio"
                                                        name="selectedGoogleBooksUrl"
                                                        value={imageLink.src}
                                                        bind:group={
                                                            selectedGoogleBooksUrl
                                                        }
                                                        class="peer" />
                                                    {imageLink.type}
                                                    <span
                                                        class="text-sm text-secondary">
                                                        {imageData.width} x {imageData.height}
                                                    </span>
                                                </p>
                                            {/snippet}
                                        </ImageWithMetadata>
                                    </div>
                                </label>
                            {/each}
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
                                    ? resolveAPIImageUrl(coverImage)
                                    : "/cover.png"}
                                alt={`${!coverImage ? "Placeholder " : ""}cover`}
                                class="w-32 aspect-[1/1.5] rounded-md" />
                        </button>
                    {/snippet}
                </BookApi>
            </div>
        </TabPanel>

        <TabPanel className="px-0.5">
            <div class="my-5 flex flex-col gap-2">
                <ImageUpload
                    bind:uploadedFile
                    allowedTypes={publicConfig.imageUploads.allowedTypes}
                    maxFileSize={publicConfig.imageUploads.maxFileSize}
                    label="Choose a cover image"
                    name="uploadedCoverImage"
                    form={formId} />
            </div>
        </TabPanel>
    </TabPanels>
</TabGroup>

{#if coverWasSelected}
    <div class="grid grid-cols-2 gap-1">
        <button form={formId} type="submit" class="btn-submit capitalize font-medium dark:border-blue-500">
            Save Form
        </button>

        <button
            onclick={discardChanges}
            class="btn-generic btn-generic-color-2">
            Discard changes
        </button>
    </div>
{/if}
