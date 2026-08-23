<script lang="ts">
    import { publicConfig } from "$src/lib/config/public";
    import { getMaxResolutionImage } from "$src/lib/utils/utils";
    import BookApi from "$components/composed/BookApiSelection/BookApi.svelte";
    import TabGroup from "$components/composed/Tab/TabGroup.svelte";
    import TabPanel from "$components/composed/Tab/TabPanel.svelte";
    import TabPanels from "$components/composed/Tab/TabPanels.svelte";
    import { resolve } from "$app/paths";
    import ImageUpload from "../../ImageUpload.svelte";

    interface Props {
        selectedVolumeId: string | undefined;
    }

    let { selectedVolumeId }: Props = $props();
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
                        You have selected the following image from Google Books:
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
                <ImageUpload
                    allowedTypes={publicConfig.imageUploads.allowedTypes}
                    maxFileSize={publicConfig.imageUploads.maxFileSize}
                    label="Choose a cover image"
                    name="uploadedCoverImage"
                    form="form-book" />
            </div>
        </TabPanel>
    </TabPanels>
</TabGroup>
