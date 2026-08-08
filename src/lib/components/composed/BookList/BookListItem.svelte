<script lang="ts">
    import IoIosRemoveCircle from "svelte-icons/io/IoIosRemoveCircle.svelte";

    import type { BookWithApiData } from "$src/app";
    import type { Book } from "$src/generated/prisma/browser";

    import { getMinResolutionImage } from "$src/lib/utils/utils";

    interface Props {
        //@ts-ignore
        book: BookWithApiData;
        allow_deletion?: boolean;
        on_delete?: ((b: Book) => unknown) | undefined;
    }

    let {
        book,
        allow_deletion = false,
        on_delete = undefined,
    }: Props = $props();
</script>

<div class="flex flex-col items-center lg:items-start group" >
    <div class="relative">
        <img
            src={book.coverImage ?? getMinResolutionImage(book.bookApiData) ?? "/cover.png"}
            alt={book.name}
            class="rounded w-32 h-40 object-cover group-hover:opacity-50" />

        <div
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
                class="group p-2 btn-delete focus:relative !border-0 group-hover:visible invisible"
                title="Remove from series"
                type="button"
                hidden={!allow_deletion || !on_delete}
                onclick={() => on_delete?.(book)}>
                <span class="block w-[20px] group-active:animate-drop-click">
                    <IoIosRemoveCircle />
                </span>
            </button>
        </div>
    </div>
    <a class="flex flex-col text-start mt-0.5" href={`../${encodeURIComponent(book.name)}`}>
        <p class="text-base">{book.name}</p>
        <p class="text-secondary text-base leading-tight">{book.author}</p>
    </a>
</div>
