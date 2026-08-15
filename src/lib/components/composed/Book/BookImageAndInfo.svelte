<script lang="ts">
    import clsx from "clsx";

    import type { BookWithApiData } from "$src/app";

    import { getMaxResolutionImage } from "$src/lib/utils/utils";

    interface Props {
        edit: boolean | undefined;
        book: BookWithApiData;
    }

    let { edit, book }: Props = $props();

    //lg:group-hover:opacity-50
    const imageClass = ` transition-all duration-300 relative bg-background-elevated text-transparent
     w-[133px] h-[199px] sm:w-[320px] sm:h-[330px] aspect-[1/1.5] object-cover object-center rounded`;

    let bookImage: string | null = $derived(
        book.coverImage ?? getMaxResolutionImage(book.bookApiData),
    );
</script>

<div class={clsx("lg:item-border-no-hover lg:p-4 relative", edit && "group")}>
    <div class="flex justify-center relative">
        {#if bookImage != null}
            <img
                src={bookImage}
                class="hidden aspect-[390/321] w-screen sm:h-[400px] blur-[28px] h-[230px] rounded object-cover object-center -z-10 dark:lg:hidden dark:block"
                alt="Flowers for Algernon"
                width="246"
                height="369"
                fetchpriority="low"
                loading="lazy" />
            <div class="dark:hidden h-[230px]"></div>

            <img
                src={bookImage}
                class={clsx(
                    "hidden blur-[20px] h-[330px] rounded object-cover object-center dark:lg:block absolute",
                )}
                alt="Flowers for Algernon"
                width="206"
                height="369"
                fetchpriority="low"
                loading="lazy" />
        {/if}

        <div
            class={clsx(
                bookImage &&
                    "absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0",
            )}>
            {#if bookImage}
                <!-- <BookImage
                bookId={book.bookApiData?.id}
                alt="thumbnail"
                sizes="(width <= 1024px) 800px, 128px"
                class={imageClass} /> -->
                <img
                    src={bookImage}
                    alt="thumbnail fallback"
                    class={imageClass} />
                <!-- {#if edit}
                <input
                  type="hidden"
                  name="coverImage"
                  value={book.coverImage} />
              {/if} -->
            {:else}
                <img
                    src="/cover.png"
                    alt="thumbnail fallback"
                    class={imageClass} />
            {/if}
        </div>

        <!-- {#if edit}
            <div
              class="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <button
                type="button"
                class="btn-generic btn-generic-color-2 group-hover:visible invisible">
                Upload
              </button>
            </div>
          {/if} -->
    </div>

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
