<script lang="ts">
    import type { ImageLinksType } from "$src/app.js";
    import ScrollingImagesBackground from "$src/lib/components/ScrollingImagesBackground.svelte";
    import { getImageByResolutionOrder } from "$src/lib/utils/utils.js";
    import { Prisma } from "$prismaBrowser";

    type ReadingActivityWithRatingAndBookApiData =
        Prisma.ReadingActivityGetPayload<{
            include: {
                rating: true;
                book: {
                    include: {
                        bookApiData: true;
                    };
                };
            };
        }>;

    interface Props {
        readingActivities: ReadingActivityWithRatingAndBookApiData[];
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

    let images = $derived(
        readingActivities
            .sort((a, b) => (b.rating?.stars ?? -1) - (a.rating?.stars ?? -1))
            .map((activity) =>
                getImageByResolutionOrder(
                    activity.book.bookApiData,
                    preferredImageOrder,
                ),
            )
            .filter((image) => image != null),
    );
</script>

<ScrollingImagesBackground {images} {...rest} />
