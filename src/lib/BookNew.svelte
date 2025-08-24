<script lang="ts">
  import { onMount } from "svelte";
  //@ts-ignore
  import AutoComplete from "simple-svelte-autocomplete";
  import { toast } from "svelte-french-toast";
  import { Moon } from "svelte-loading-spinners";
  import { twMerge } from "tailwind-merge";

  import { MAX_RATING } from "../constants";
  import BookApi from "./BookApiSelection/BookApi.svelte";
  import DateSelector, { type OptionalDate } from "./DateSelector.svelte";
  import EventDone from "./icons/EventDone.svelte";
  import EventProgress from "./icons/EventProgress.svelte";
  import Words from "./icons/words.svelte";
  import Rating from "./Rating.svelte";
  import TabGroup from "./Tab/TabGroup.svelte";
  import TabPanel from "./Tab/TabPanel.svelte";
  import TabPanels from "./Tab/TabPanels.svelte";
  import ToggleGroup from "./ToggleGroup.svelte";
  import { slideHeight } from "./utils";

  import type { Prisma } from "@prisma/client";

  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { READING_STATUS, type queriedBookFull } from "$appTypes";

  export let endpoint = "/book/create";

  const CREATABLE_READING_STATUS = ["read", "reading", "to read"] as const;
  type CreatableReadingStatus = (typeof CREATABLE_READING_STATUS)[number];

  export let readingStatus: CreatableReadingStatus = "read";

  export let readingActivities: Prisma.ReadingActivityGetPayload<{
    include: { book: { include: { bookList: true } } };
  }>[];

  let authors: string[] = readingActivities.map((e) => e.book.author);

  $: authors = [...new Set(authors)];

  let new_book_open = false;
  let name = "";
  let author = "";
  let read_now = false;
  let stars: number;
  let wordsPerPage: number;
  let dateStarted: OptionalDate;
  let dateFinished: OptionalDate;

  let loading = false;

  let api_query = "";
  let api_open = false;

  $: has_content = name.length > 0 && author.length > 0;
  let volumeId: string;
  // const dispatch = createEventDispatcher();

  async function newBook() {
    loading = true;

    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        name,
        author,
        volumeId,
        read_now,
        stars,
        wordsPerPage,
        dateStarted,
        dateFinished,
        readingStatus:
          readingStatus == "read" ? READING_STATUS.FINISHED : readingStatus,
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const { success, message } = await response.json();
    loading = false;

    if (success) {
      invalidateAll();
      toast.success(
        "Successfully added book" + (message ? ": " + message : "")
      );
    } else {
      if (message) {
        toast.error(message);
      } else {
        toast.error(
          "[" +
            response.status +
            "]" +
            " Error creating book: " +
            response.statusText
        );
      }
    }
  }

  let getBookPromise: Promise<queriedBookFull> | undefined = undefined;
  $: {
    getBookPromise;
    take_over();
  }
  async function take_over() {
    if (getBookPromise !== undefined) {
      let data = await getBookPromise;
      // console.log(data);
      name = data?.volumeInfo.title || "";

      author = data?.volumeInfo.authors[0] || "";
    } else {
      api_open = true;
      api_query = name + " " + author;
    }
  }

  const toggleContent = () => {
    new_book_open = !new_book_open;
    localStorage.setItem("BookNewCollapseState", String(new_book_open));
  };

  onMount(() => {
    // console.log(localStorage.getItem("BookNewCollapseState"));

    new_book_open = localStorage.getItem("BookNewCollapseState") == "true";
  });

  let showMore = false;
</script>

<div
  class="border rounded-md p-3 my-2 dark:bg-slate-700 dark:border-slate-600 bg-white">
  <div class="flex justify-between">
    <h2
      class={twMerge(
        "text-2xl flex items-center justify-center ease-in-out duration-500",
        new_book_open && "-translate-y-[32px] text-xl"
      )}
      style="transition-property: transform, font-size;">
      Add new book
    </h2>
    <div>
      <button
        type="button"
        on:click={toggleContent}
        class="ml-auto rounded-lg border hover:bg-gray-50 px-5 py-2 text-sm font-medium
      dark:bg-slate-600 dark:border-slate-600 dark:hover:bg-slate-500 dark:hover:border-slate-500 min-w-24">
        {new_book_open ? "Cancel" : "Open"}
      </button>
    </div>
  </div>

  {#if new_book_open}
    <div transition:slideHeight class="">
      <form>
        <p>Have you already read the book?</p>
        <ToggleGroup
          options={[...CREATABLE_READING_STATUS]}
          groupClass="mb-5 mt-1 inline-flex"
          btnClass="px-4 py-1 hover:bg-gray-50 dark:hover:bg-slate-500 border border-s-0 dark:border-slate-500 dark:bg-slate-600"
          btnSelectedClass="dark:bg-slate-500 bg-gray-100"
          startClass="border-s rounded-s-md"
          endClass="rounded-e-md"
          bind:selectedOption={readingStatus} />

        <TabGroup
          btnClass="px-4 py-1 dark:hover:border-slate-400 text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
          btnSelectedClass="dark:text-slate-100 text-slate-900"
          sliderClass="border-b-2 dark:border-slate-500 border-slate-400"
          tabNames={["search", "manually"]}
          animate={false}>
          <!-- TODO: tabtrigger info if there is a book selected -->
          <TabPanels className="">
            <TabPanel className="px-0.5">
              <!-- <p class="-mb-1">Search using google books</p> -->
              <BookApi
                label="Search using google books"
                bind:volumeId
                bind:getBookPromise
                bind:query={api_query}
                on:select={() => {
                  showMore = true;
                }} />
            </TabPanel>
            <TabPanel className="px-0.5">
              <p>Enter info manually</p>
              <div class="grid grid-cols-2 grid-rows-2 items-center gap-1">
                <label for="name">Name:</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  class="rounded-md dark:bg-slate-600 dark:border-slate-500"
                  bind:value={name} />
                <label for="author">Author:</label>
                <!-- <input
                    id="author"
                    name="author"
                    type="text"
                    class="input dark:bg-slate-600 dark:border-slate-500"
                    bind:value={author}
                  /> -->
                <AutoComplete
                  items={authors}
                  bind:text={author}
                  create={true}
                  id="author"
                  name="author"
                  class="input border-gray-500 dark:bg-slate-600 dark:border-slate-500" />
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>

        {#if showMore || (name.length > 0 && author.length > 0)}
          <div class="grid grid-cols-2 gap-2">
            {#if readingActivities.some((e) => e.book.name === name && e.book.author === author)}
              <p class="text-warning text-base col-span-2">
                Info: A book with this name (and author) is already in this
                list.
              </p>
            {/if}
            {#if readingStatus == "reading" || readingStatus == "read"}
              <label
                class="col-span-2 flex flex-wrap items-center justify-between"
                for="dateStarted">
                <div class="icon-wrapper">
                  <span class="w-5 block" title="date read">
                    <EventProgress />
                  </span>
                  Date started:
                </div>

                <DateSelector
                  id="dateStarted"
                  className="w-full sm:w-auto"
                  inputClassName="btn-generic-color-2 rounded-md w-full sm:w-auto"
                  bind:datetime={dateStarted} />
              </label>
            {/if}

            {#if readingStatus == "read"}
              <label
                class="col-span-2 flex flex-wrap items-center justify-between"
                for="dateEnd">
                <div class="icon-wrapper">
                  <span class="w-5 block" title="date read">
                    <EventDone />
                  </span>
                  Date read/finished:
                </div>

                <DateSelector
                  id="dateEnd"
                  className="w-full sm:w-auto"
                  inputClassName="btn-generic-color-2 rounded-md w-full sm:w-auto"
                  bind:datetime={dateFinished} />
              </label>
            {/if}

            {#if readingStatus != "to read"}
              <div class="mt-1">
                <label for="rating">Rating:</label>
                <Rating
                  rating_max={MAX_RATING}
                  editable={true}
                  bind:rating={stars} />
              </div>

              <div class="mt-1">
                <label for="words-per-page" class="icon-wrapper">
                  <span class="w-5 block" title="date read">
                    <Words />
                  </span>
                  Words per page:
                </label>
                <input
                  id="words-per-page"
                  name="words-per-page"
                  type="number"
                  class="rounded-md dark:bg-slate-600 dark:border-slate-500 w-full"
                  bind:value={wordsPerPage} />
              </div>
            {/if}
          </div>
        {/if}

        <div class="flex justify-end">
          <button
            on:click={newBook}
            class="btn-primary-black mt-5 mb-1 transition-all"
            title="Add new book"
            disabled={!has_content}
            type="button">
            {#if loading}
              <div>
                <Moon size="20" color="white" duration="1s" />
              </div>
            {/if}
            Save new book
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>

<style lang="postcss">
  .btn-group-btn {
    @apply dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700;
  }

  .btn-group-selected {
    @apply dark:bg-slate-700 bg-gray-50;
  }
</style>
