<script context="module" lang="ts">
  export type ItemDeleteEvent = { entry: ReadingListItemType };
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import clsx from "clsx";
  //@ts-ignore
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";

  import { MAX_RATING } from "$lib/constants/constants";

  import { type ReadingListItemType } from "$appTypes";
  import { formatShort } from "$components/input/DateSelector.svelte";
  import CalenderAdd from "$lib/icons/CalenderAdd.svelte";
  import EventDone from "$lib/icons/EventDone.svelte";
  import EventProgress from "$lib/icons/EventProgress.svelte";
  import Pages from "$lib/icons/pages.svelte";
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
  import AccentBarItemCard from "$lib/components/composed/AccentBarItemCard.svelte";
  import BookActions from "./Actions/BookActions.svelte";
  import { categoriesToColor } from "$src/categoryToColor/colorMap";

  export let entry: ReadingListItemType;
  export let isAuthorizedToModify = false;
  $: book = entry.book;

  // export let deletionBook: Book | undefined = undefined;
  // export let openModal: boolean = false;
  export let allow_deletion: boolean | undefined = true;

  const dispatch = createEventDispatcher<{ delete: ItemDeleteEvent }>();
  // console.log(book);

  const book_url = encodeURIComponent(entry.book.name);

  // const colors = [
  //   "bg-red-500",
  //   "bg-orange-500",
  //   "bg-lime-500",
  //   "bg-green-600",
  //   "bg-emerald-500",
  //   "bg-teal-600",
  //   "bg-cyan-400",
  //   "bg-blue-600",
  //   "bg-indigo-500",
  //   "bg-violet-600",
  //   "bg-fuchsia-600",
  //   "bg-rose-600",
  // ];

  const colors: { h: number; s: number; l: number }[] = [
    { h: 0.0, s: 0.84, l: 0.6 }, // red-500
    { h: 0.067, s: 0.95, l: 0.53 }, // orange-500
    { h: 0.233, s: 0.81, l: 0.44 }, // lime-500
    { h: 0.394, s: 0.71, l: 0.45 }, // green-600
    { h: 0.444, s: 0.84, l: 0.39 }, // emerald-500
    { h: 0.481, s: 0.8, l: 0.36 }, // teal-600
    { h: 0.525, s: 0.94, l: 0.43 }, // cyan-400
    { h: 0.603, s: 0.91, l: 0.6 }, // blue-600
    { h: 0.664, s: 0.84, l: 0.67 }, // indigo-500
    { h: 0.728, s: 0.83, l: 0.58 }, // violet-600
    { h: 0.811, s: 0.84, l: 0.61 }, // fuchsia-600
    { h: 0.961, s: 0.87, l: 0.61 }, // rose-600
  ];

  const getColor = (name: string, author: string) => {
    const hash = hashCode(name + author);
    let index = hash % colors.length;
    if (index < 0) {
      index += colors.length;
    }
    return colors[index];
  };

  let accentColor: { h: number; s: number; l: number } = { h: 0, s: 0, l: 0 };
  $: {
    const cats = book.bookApiData?.categories.map((cat) => cat.name);

    accentColor = categoriesToColor(cats) ?? getColor(book.name, book.author);
  }

  /**
   * Returns a hash code from a string
   * @param  {String} str The string to hash.
   * @return {Number}    A 32bit integer
   * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
   * @credit https://stackoverflow.com/a/8831937
   */
  function hashCode(str: string) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
      let chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
</script>

<!-- barClass={getColor(book.name, book.author)} -->

<AccentBarItemCard
  accentStyle={`background-color: hsl(${accentColor.h * 360}, ${
    accentColor.s * 100
  }%, 50%);`}
  wrapperClass={clsx(
    (entry.status.status === READING_ACTIVITY_TYPES.PAUSED ||
      entry.status.status === READING_ACTIVITY_TYPES.DID_NOT_FINISH) &&
      "opacity-75"
  )}>
  <div class="grid grid-cols-8 items-center grid-rows-2 sm:grid-rows-1">
    <div class="col-span-full sm:col-span-3">
      <a
        href="/{entry.account.username}/book/{book_url}"
        class="text-md text-ellipsis overflow-hidden leading-3">
        {book.name}
      </a>
      <p class="text-gray-600 dark:text-slate-300 -mt-1">{book.author}</p>
    </div>

    <div class="flex items-center col-span-full sm:col-span-5">
      <div class="flex flex-1">
        <p class="flex items-center gap-1">
          {#if entry.dateFinished}
            {formatShort(entry.dateFinished)}
            <span class="icon" title="date read"><EventDone /></span>
          {:else if entry.dateStarted}
            {formatShort(entry.dateStarted)}
            <span class="icon" title="date started"><EventProgress /></span>
          {:else}
            <span class="flex-shrink leading-4">
              {book.createdAt.toLocaleString()}
            </span>
            <span class="icon flex-shrink-0" title="date added">
              <CalenderAdd />
            </span>
          {/if}
        </p>
      </div>

      {#if entry.status.status === READING_ACTIVITY_TYPES.PAUSED}
        <p class="text-secondary">Paused</p>
      {:else if entry.status.status === READING_ACTIVITY_TYPES.DID_NOT_FINISH}
        <p
          class="text-red-600 dark:text-red-500 flex justify-end flex-1 uppercase">
          Dropped
        </p>
      {/if}

      {#if entry.rating?.stars}
        <div class="flex sm:gap-2 gap-1 items-center justify-end flex-1">
          <p>{entry.rating.stars} / {MAX_RATING}</p>
          <span class="icon" aria-label="stars"><IoIosStar /></span>
        </div>
      {/if}

      {#if book.bookApiData?.pageCount}
        <div class="flex sm:gap-2 gap-1 items-center justify-end flex-1">
          <p>{book.bookApiData.pageCount}</p>
          <span aria-label="number of pages" class="icon"><Pages /></span>
        </div>
      {/if}

      <slot name="actions">
        <BookActions
          {isAuthorizedToModify}
          {allow_deletion}
          {entry}
          on:delete={(e) => dispatch("delete", e.detail)} />
      </slot>
    </div>
  </div>
</AccentBarItemCard>

<style lang="postcss">
  .icon {
    width: 20px;
    height: 20px;
  }

  /*
  .book-item-grid {
    display: grid;
    flex-grow: 1;
    grid-template-rows: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    row-gap: 0;
    align-items: center;
    height: 100%;
    // grid-template-columns: repeat(auto-fit, minmax(50px, 1fr)); 
    grid-template-rows: auto;
  }

  @media (min-width: 640px) {
    .book-item-grid {
      grid-template-rows: repeat(1, minmax(0, 1fr));
    }
  }
  */
</style>
