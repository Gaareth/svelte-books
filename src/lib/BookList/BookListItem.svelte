<script lang="ts">
  import type { BookListItemType } from "$appTypes";
  import Image from "$lib/Image.svelte";
  //@ts-ignore
  import IoIosRemoveCircle from "svelte-icons/io/IoIosRemoveCircle.svelte";

  export let book: BookListItemType;
  export let allow_deletion = false;
  export let on_delete: ((b: BookListItemType) => unknown) | undefined =
    undefined;
</script>

<div class="flex flex-col items-center lg:items-start group">
  <div class="relative">
    <Image
      src={book.bookApiData?.thumbnailUrl}
      alt={book.name}
      class="rounded w-32 h-40 object-cover group-hover:opacity-50"
    />

    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    >
      <button
        class="group p-2 btn-delete focus:relative !border-0 group-hover:visible invisible"
        title="Remove from series"
        type="button"
        hidden={!allow_deletion || !on_delete}
        on:click={() => on_delete?.(book)}
      >
        <span class="block w-[20px] group-active:animate-drop-click">
          <IoIosRemoveCircle />
        </span>
      </button>
    </div>
  </div>
  <div class="flex flex-col text-start mt-0.5">
    <p class="text-base">{book.name}</p>
    <p class="text-secondary text-base leading-tight">{book.author}</p>
  </div>
</div>
