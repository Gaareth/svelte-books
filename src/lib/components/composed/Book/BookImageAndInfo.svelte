<script lang="ts">
    import clsx from "clsx";

    import AddImageIcon from "$src/lib/icons/AddImageIcon.svelte";
    import Modal from "../../Modal.svelte";

    import CoverImage, { hasCoverImage } from "./CoverImage.svelte";
    import type { BookWithImage } from "$src/app";
    import CoverSelection from "./CoverSelection.svelte";
    // import type { ActionData } from "$routes/[[username]]/book/[name]/$types";
    import type { ActionData } from "../../../../routes/[[username]]/book/[name]/$types";

    interface Props {
        edit: boolean | undefined;
        book: BookWithImage;
        formId: string;
        form?: ActionData;
        formIsSubmitting?: boolean;
    }

    let {
        edit,
        book,
        formId,
        form,
        formIsSubmitting = false,
    }: Props = $props();

    //lg:group-hover:opacity-50
    const imageSizeClass =
        "max-w-full h-[300px] sm:w-[320px] sm:h-[330px] lg:w-[199px] aspect-[2/3]";

    const imageClass =
        clsx(`transition-all duration-300 relative text-transparent
      ${imageSizeClass} object-cover object-center rounded`);

    let coverSelection: CoverSelection | undefined = $state();

    let showChooseCoverImageModal = $state(false);
    $effect(() => {
        if (form?.errors?.uploadedCoverImage) {
            showChooseCoverImageModal = true;
        }

        // reset on successful form submission
        if (!edit) {
            showChooseCoverImageModal = false;
            coverSelection?.discardChanges();
        }
    });

    let hasImage: boolean | undefined = $derived(hasCoverImage(book));
</script>

<div class={clsx("lg:item-border-no-hover lg:p-4 relative", edit && "group")}>
    <div class="flex flex-col justify-center relative">
        {#if hasImage}
            <div
                class="h-[300px] sm:h-[400px] w-full mb-10 hidden dark:block dark:lg:hidden">
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
                !hasImage && "flex justify-center items-center",
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
                    commandFor="coverSelectionModal"
                    command="show-modal"
                    type="button"
                    class="btn-generic btn-generic-color-2 flex items-center gap-1 opacity-95 !backdrop-blur-xl">
                    Change <AddImageIcon />
                </button>
            </div>
        {/if}
    </div>

    {#if edit}
        <div class="hidden lg:flex justify-center mt-2 mb-4">
            <button
                commandFor="coverSelectionModal"
                command="show-modal"
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
    id="coverSelectionModal"
    bind:showModal={showChooseCoverImageModal}
    divClassName="w-full"
    className="w-[95%] lg:w-2/5">
    {#snippet header()}
        <div class="flex items-center gap-4 w-full">
            <p class="font-medium">Choose a book cover</p>
        </div>
    {/snippet}

    <CoverSelection
        bind:this={coverSelection}
        errorMsgs={form?.errors?.uploadedCoverImage}
        {book}
        {formId}
        {formIsSubmitting} />
</Modal>
