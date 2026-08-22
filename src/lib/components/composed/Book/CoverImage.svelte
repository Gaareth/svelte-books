<script module lang="ts">
    // use to check if book will render /cover.png or not. is way faster than exposing via bind
    export function hasCoverImage(book: BookWithCoverImage): boolean {
        return getBookImage(book) != null;
    }

    export function getBookImage(
        book: BookWithCoverImage,
        getGoogleImageUrl: (
            imageLinks: string,
        ) => string | null = getMaxResolutionImage,
    ): string | undefined {
        if (book.coverImage && publicConfig.imageUploads.urlPrefix) {
            return makeUploadUrl(book.coverImage.path);
        }

        if (book.bookApiData?.imageLinksJSON == null) {
            return;
        }

        const googleImageUrl = getGoogleImageUrl(
            book.bookApiData?.imageLinksJSON,
        );

        if (googleImageUrl == null) {
            return;
        }

        const proxiedUrl = resolve(
            `/api/book-covers?url=${encodeURIComponent(googleImageUrl)}`,
        );

        return proxiedUrl;
    }

    export function createBookImageSrcset(
        book: BookWithCoverImage,
    ): string | undefined {
        return book.coverImage?.variants
            .map((v) => `${makeUploadUrl(v.path)} ${v.width}w`)
            .join(", ");
    }
</script>

<script lang="ts">
    import { resolve } from "$app/paths";
    import type { Prisma } from "$prismaBrowser";
    import { publicConfig } from "$src/lib/config/public";
    import { makeUploadUrl } from "$src/lib/utils/browserUtils";
    import { getMaxResolutionImage } from "$src/lib/utils/utils";

    import Image, { type ImageProps } from "./Image.svelte";

    type BookWithCoverImage = Prisma.BookGetPayload<{
        include: {
            coverImage: {
                include: {
                    variants: true;
                };
            };

            bookApiData: true;
        };
    }>;

    interface Props extends ImageProps {
        book: BookWithCoverImage;
        alt?: string;
    }

    let { book, alt, ...rest }: Props = $props();

    const srcset = $derived(createBookImageSrcset(book));

    let bookImage: string | undefined = $derived(getBookImage(book));

    const fallbackImage = "/cover.png";
    const altInternal = $derived(
        bookImage ? "book cover" : "book cover placeholder",
    );
</script>

<Image
    src={bookImage ?? fallbackImage}
    placeholderHash={book.coverImage?.placeholderHash}
    {srcset}
    alt={alt || altInternal}
    {...rest} />
