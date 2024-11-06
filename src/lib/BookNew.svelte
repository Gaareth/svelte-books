<script lang="ts">
  import TabPanels from "./Tab/TabPanels.svelte";
  import TabPanel from "./Tab/TabPanel.svelte";
  import Rating from "./Rating.svelte";
  import BookApiDetails from "./BookApiSelection/BookApiDetails.svelte";
  import { invalidateAll } from "$app/navigation";
  import { page } from "$app/stores";
  import { toast } from "svelte-french-toast";
  import { Moon } from "svelte-loading-spinners";

  //@ts-ignore
  import ArrowDown from "svelte-icons/io/IoMdArrowDropdown.svelte";
  //@ts-ignore
  import ArrowUp from "svelte-icons/io/IoMdArrowDropup.svelte";

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import AutoComplete from "simple-svelte-autocomplete";
  import BookApi from "./BookApiSelection/BookApi.svelte";
  import type { queriedBookFull } from "$appTypes";
  import InputNumber from "./InputNumber.svelte";
  import { unknown } from "zod";
  import { MAX_RATING } from "../constants";
  import { onMount, type EventDispatcher } from "svelte";
  import { twMerge } from "tailwind-merge";
  import ToggleGroup from "./ToggleGroup.svelte";
  import TabGroup from "./Tab/TabGroup.svelte";
  import Tab from "./Tab/Tab.svelte";
  import { backInOut, circIn, circInOut, circOut, cubicInOut, cubicOut, elasticInOut, linear, sineIn, sineInOut, sineOut } from "svelte/easing";

  export let endpoint = "/book/create";
  export let listName: string;
  export let authors: string[];
  $: authors = [...new Set(authors)];

  let new_book_open = false;
  let name = "";
  let author = "";
  let read_now = false;
  let rating: number;
  let words_per_page: number;

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
        listName,
        volumeId,
        read_now,
        rating,
        words_per_page,
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const { success, message } = await response.json();
    loading = false;

    if (success) {
      invalidateAll();
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
    console.log(localStorage.getItem("BookNewCollapseState"));

    new_book_open = localStorage.getItem("BookNewCollapseState") == "true";
  });

  let selectedOption: "read" | "reading" | "to read" = "read";

  let showMore = false;
  let selectedOptionFinished: "last month" | "this month" | "today";

  $: finishedDate = (() => {
    const now = new Date();
    let date;

    switch (selectedOptionFinished) {
      case "last month":
        date = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "this month":
        date = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "today":
        date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      default:
        return undefined;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dtString = `${year}-${month}-${day}`;
    // Format the date to 'YYYY-MM-DD'
    return dtString;
  })();

  function slideHeight(node, { duration = 500 }) {
    const style = getComputedStyle(node);
    const height = parseFloat(style.height);

    return {
      duration,
      css: t => `height: ${t * height}px; overflow: hidden;`,
      easing: sineInOut
    };
  }
</script>

{#if $page.data.session}
  <div
    class="border rounded-md p-3 my-2 dark:bg-slate-700 dark:border-slate-600 bg-white"
  >
    <!-- <legend hidden={!new_book_open}>Add new book</legend> -->
    <div class="flex justify-between">
      <h2
        class={twMerge(
          "text-2xl flex items-center justify-center ease-in-out duration-500",
          new_book_open && "-translate-y-[32px] text-xl"
        )}
        style="transition: transform font-size;"
      >
        Add new book
      </h2>
      <button
        type="button"
        on:click={toggleContent}
        class="ml-auto rounded-lg border hover:bg-gray-50 px-5 py-2 text-sm font-medium
      dark:bg-slate-600 dark:border-slate-600 dark:hover:bg-slate-500 dark:hover:border-slate-500 min-w-24"
      >
        {new_book_open ? "Cancel" : "Open"}
      </button>
    </div>

    {#if new_book_open}
      <div transition:slideHeight class="overflow-hidden">
        <form>
          <p>Have you already read the book?</p>
          <ToggleGroup
            options={["read", "reading", "to read"]}
            groupClass="mb-5 mt-1 inline-flex border rounded-md dark:border-slate-500 dark:bg-slate-600"
            btnClass="px-4 py-1 dark:hover:bg-slate-500"
            btnSelectedClass="dark:bg-slate-500"
            bind:selectedOption
          />

          <!-- <div class="grid grid-cols-2 max-w-[28rem] mx-auto mt-5 mb-3">
      <button
        type="button"
        class="border-b dark:border-slate-500"
        on:click={() => (selectedTab = "search")}
      >
        Search using google books
      </button>
      <button type="button" on:click={() => (selectedTab = "manually")}>
        Enter manually
      </button>
    </div> -->

          <TabGroup
            btnClass="px-4 py-1 dark:hover:border-slate-400 text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
            btnSelectedClass="dark:text-slate-100 text-slate-900"
            sliderClass="border-b-2 dark:border-slate-500 border-slate-400"
            tabNames={["search", "manually"]}
            animate={false}
          >
            <TabPanels className="">
              <TabPanel className="px-0.5">
                <p class="-mb-1">Search using google books</p>
                <BookApi
                  bind:getBookPromise
                  bind:query={api_query}
                  on:select={() => (showMore = true)}
                />
              </TabPanel>
              <TabPanel className="px-0.5">
                <p>Enter info manually</p>
                <div class="grid grid-cols-2 grid-rows-2 items-center gap-1">
                  <label for="name">Name:</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    class="input dark:bg-slate-600 dark:border-slate-500"
                    bind:value={name}
                  />
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
                    class="input dark:bg-slate-600 dark:border-slate-500"
                  />
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>

          {#if showMore || (name.length > 0 && author.length > 0)}
            <div
              class="grid grid-cols-2 sm:grid-cols-4 pt-2 items-center gap-4 gap-x-5"
            >
              {#if selectedOption == "reading" || selectedOption == "read"}
                <p class="col-span-2 sm:col-span-1">Date started:</p>
                <div
                  class="flex flex-wrap gap-1 sm:gap-2 col-span-2 sm:col-span-3 sm:ml-auto justify-center sm:justify-normal -mt-2 sm:mt-0"
                >
                  <ToggleGroup
                    options={["last month", "this month", "today"]}
                    groupClass="inline-flex border rounded-md dark:border-slate-500 dark:bg-slate-600"
                    btnClass="px-2 dark:hover:bg-slate-500"
                    btnSelectedClass="dark:bg-slate-500"
                    bind:selectedOption={selectedOptionFinished}
                    defaultOption={1}
                  />

                  <input
                    bind:value={finishedDate}
                    type="date"
                    name="finished"
                    class="dark:border-slate-500 dark:bg-slate-600 rounded-md py-0"
                  />
                </div>
              {/if}

              {#if selectedOption == "read"}
                <p class="col-span-2 sm:col-span-1">Date Read/finished:</p>
                <div
                  class="flex flex-wrap gap-1 sm:gap-2 col-span-2 sm:col-span-3 sm:ml-auto justify-center sm:justify-normal -mt-2 sm:mt-0"
                >
                  <ToggleGroup
                    options={["last month", "this month", "today"]}
                    groupClass="inline-flex border rounded-md dark:border-slate-500 dark:bg-slate-600"
                    btnClass="px-2 dark:hover:bg-slate-500"
                    btnSelectedClass="dark:bg-slate-500"
                    bind:selectedOption={selectedOptionFinished}
                    defaultOption={1}
                  />

                  <input
                    bind:value={finishedDate}
                    type="date"
                    name="finished"
                    class="dark:border-slate-500 dark:bg-slate-600 rounded-md py-0"
                  />
                </div>
              {/if}

              <div class="col-span-2 grid grid-cols-2 gap-1">
                <label for="rating">Rating:</label>
                <Rating rating_max={MAX_RATING} editable={true} bind:rating />
              </div>

              <div class="col-span-2 grid grid-cols-2 gap-1">
                <label for="words-per-page">Words per page:</label>
                <input
                  id="words-per-page"
                  name="words-per-page"
                  type="number"
                  class="input dark:bg-slate-600 dark:border-slate-500"
                  bind:value={words_per_page}
                />
              </div>
            </div>
          {/if}

          <div class="flex justify-end">
            <button
              on:click={newBook}
              class="btn-primary-black mt-5 mb-1 transition-all"
              title="Add new book"
              disabled={!has_content}
              type="button"
            >
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
{/if}

<style lang="postcss">
  .btn-group-btn {
    @apply dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700;
  }

  .btn-group-selected {
    @apply dark:bg-slate-700 bg-gray-50;
  }
</style>
