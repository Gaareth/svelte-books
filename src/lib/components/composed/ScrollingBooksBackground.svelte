<script lang="ts">
    import type { ImageLinksType } from "$src/app.js";
    import ScrollingImagesBackground from "$src/lib/components/ScrollingImagesBackground.svelte";
    import { getImageByResolutionOrder } from "$src/lib/utils/utils.js";
    import { Prisma } from "$prismaBrowser";
    import Image from "./Book/Image.svelte";
    import {
        createBookImageSrcset,
        getBookImage,
    } from "./Book/CoverImage.svelte";

    type ReadingActivityWithRatingAndImage = Prisma.ReadingActivityGetPayload<{
        include: {
            rating: true;
            book: {
                include: {
                    bookApiData: true;
                    coverImage: {
                        include: {
                            variants: true;
                        };
                    };
                };
            };
        };
    }>;

    interface Props {
        readingActivities: ReadingActivityWithRatingAndImage[];
        [key: string]: unknown;
    }

    let { readingActivities, ...rest }: Props = $props();

    let preferredImageOrder: (keyof ImageLinksType)[] = [
        "medium",
        "large",
        "extraLarge",
        "small",
        "thumbnail",
        "smallThumbnail",
    ];

    let booksAndImages = $derived(
        readingActivities
            .sort((a, b) => (b.rating?.stars ?? -1) - (a.rating?.stars ?? -1))
            .map((activity) => {
                return {
                    src: getBookImage(activity.book, (imageLinks) =>
                        getImageByResolutionOrder(
                            imageLinks,
                            preferredImageOrder,
                        ),
                    ),
                    book: activity.book,
                };
            })
            .filter((bookAndImage) => bookAndImage.src != null),
    );

    let bookIds = $derived(booksAndImages.map((b) => b.book.id));
    let imageAndBookByBookId = $derived(
        Object.fromEntries(booksAndImages.map((b) => [b.book.id, b])) as Record<
            string,
            { src: string; book: ReadingActivityWithRatingAndImage["book"] }
        >,
    );
</script>

<ScrollingImagesBackground images={bookIds} {...rest}>
    {#snippet ImageSnippet(
        bookId: string,
        imageClass: string,
        IMAGE_WIDTH: number,
        IMAGE_HEIGHT: number,
    )}
        <Image
            src={imageAndBookByBookId[bookId].src}
            srcset={createBookImageSrcset(imageAndBookByBookId[bookId].book)}
            placeholderHash={imageAndBookByBookId[bookId].book.coverImage
                ?.placeholderHash}
            class={imageClass}
            alt="book cover"
            style="width: {IMAGE_WIDTH}px; height: {IMAGE_HEIGHT}px;"
            fetchpriority="high"
            loading="eager" />
    {/snippet}
</ScrollingImagesBackground>
