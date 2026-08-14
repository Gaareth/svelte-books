<script lang="ts">



    import FilterIcon from "svelte-icons/fa/FaFilter.svelte";
    import SortDesc from "svelte-icons/fa/FaSortAmountDown.svelte";
    import SortAsc from "svelte-icons/fa/FaSortAmountUp.svelte";

    import EqRelation from "./EqRelation.svelte";
    import SortOrder from "./SortOrder.svelte";
    import ClearButton from "../../input/ClearButton.svelte";
    import ToggleGroup from "../../input/ToggleGroup.svelte";

    import type { ReadingListItemType } from "$appTypes";

    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { MAX_RATING } from "$lib/constants/constants";
    import { createSearchStore } from "$lib/stores/search";
    import {
        dateToYYYY_MM_DD,
        optionalToDate,
        sortReadingActivity,
    } from "$lib/utils/utils";

    type sortOption =
        "date_created" | "date_read" | "author" | "title" | "rating";

    interface Props {
        languages_used: string[];
        category_names: string[]; // not reactive
        searchStore: ReturnType<typeof createSearchStore<any>>;
    }

    let { languages_used, category_names, searchStore }: Props = $props();

    // update when url changes, back button pressed
    const params = $derived(page.url.searchParams);

    class FilterParams {
        lang: string | undefined = $state();
        rating: number | undefined = $state();
        start_date: Date | undefined = $state();
        end_date: Date | undefined = $state();
        categories: string[] | undefined = $state();
        show_active_or_all: "all" | "only active" = $state("only active");

        constructor(
            lang: string | undefined,
            rating: number | undefined,
            start_date: Date | undefined,
            end_date: Date | undefined,
            categories: string[] | undefined,
            show_active_or_all: "all" | "only active" = "only active",
        ) {
            this.lang = lang;
            this.rating = rating;
            this.start_date = start_date;
            this.end_date = end_date;
            this.categories = categories;
            this.show_active_or_all = show_active_or_all;
        }

        static fromParams(params: URLSearchParams): FilterParams {
            return new FilterParams(
                params.get("lang") ?? "all",
                params.get("rating") !== null
                    ? Number(params.get("rating"))
                    : undefined,
                parseFilterDate(params.get("start_date")),
                parseFilterDate(params.get("end_date")),
                JSON.parse(params.get("categories") ?? "[]") as string[],
                params.get("active") === "all" ? "all" : "only active",
            );
        }

        setParams(params: URLSearchParams): URLSearchParams {
            if (this.lang !== undefined && this.lang !== "all") {
                params.set("lang", this.lang);
            } else {
                params.delete("lang");
            }

            if (this.rating !== undefined) {
                params.set("rating", String(this.rating));
            } else {
                params.delete("rating");
            }

            if (this.start_date !== undefined) {
                params.set("start_date", dateToYYYY_MM_DD(this.start_date));
            } else {
                params.delete("start_date");
            }

            if (this.end_date !== undefined) {
                params.set("end_date", dateToYYYY_MM_DD(this.end_date));
            } else {
                params.delete("end_date");
            }

            if (this.categories !== undefined && this.categories.length > 0) {
                params.set("categories", JSON.stringify(this.categories));
            } else {
                params.delete("categories");
            }

            if (this.show_active_or_all === "all") {
                params.set("active", "all");
            } else {
                params.delete("active");
            }

            params.set("filter", "true");

            return params;
        }

        matchesRating(b: ReadingListItemType): boolean {
            return (
                this.rating === undefined ||
                Math.floor(b.rating?.stars ?? 0) === this.rating
            );
        }

        matchesStart(b: ReadingListItemType): boolean {
            const startDate =
                optionalToDate(b.dateStarted ?? b.dateFinished) ?? b.createdAt;

            return (
                this.start_date === undefined ||
                (startDate != null && this.start_date <= startDate)
            );
        }

        matchesEnd(b: ReadingListItemType): boolean {
            const endDate =
                optionalToDate(b.dateFinished ?? b.dateStarted) ?? b.createdAt;

            return (
                this.end_date === undefined ||
                (endDate != null && this.end_date >= endDate)
            );
        }

        matchesCategory(b: ReadingListItemType): boolean {
            return (
                this.categories === undefined ||
                this.categories.length === 0 ||
                !!b.book.bookApiData?.categories.find(({ name: c }) =>
                    (this.categories ?? []).includes(c),
                )
            );
        }

        matchesLanguage(b: ReadingListItemType): boolean {
            return (
                this.lang === undefined ||
                this.lang === "all" ||
                b.book.bookApiData?.language === this.lang
            );
        }
    }

    // params from the url state
    let filterParams = $derived(FilterParams.fromParams(params));

    // locally editable input state
    // svelte-ignore state_referenced_locally
    let inputParams = $state(FilterParams.fromParams(params));
    // upon pressing the filter button, the the inputParams are applied to the url params (in setParamsFromFilter)

    $effect(() => {
        // always apply filter from url params, so that back button works
        $searchStore.filter = (b: ReadingListItemType) =>
            filterParams.matchesRating(b) &&
            filterParams.matchesStart(b) &&
            filterParams.matchesEnd(b) &&
            filterParams.matchesCategory(b) &&
            filterParams.matchesLanguage(b);

        inputParams = FilterParams.fromParams(params);
    });

    // if not type of sortOption, than sorting will just use the default, so no need to explicitly check here
    let selectedSort = $derived(
        (params.get("sort") as sortOption) ?? "date_read",
    );
    let sortingReversed = $derived((params.get("order") ?? "desc") === "desc");

    function parseFilterDate(value: string | null) {
        if (!value) {
            return undefined;
        }

        const date = new Date(value);
        date.setHours(0, 0, 0, 0);

        return date;
    }

    // onMount(async () => {
    //     // setFiltersFromParams();
    //     await filter(true);
    // });

    const sortBooks = () => {
        if (selectedSort === undefined) {
            return;
        }

        let params = page.url.searchParams;
        params.set("order", sortingReversed ? "desc" : "asc");
        params.set("sort", selectedSort);

        goto("?" + params.toString(), {
            noScroll: true,
        });

        $searchStore!.sort = (a: ReadingListItemType, b: ReadingListItemType) =>
            cmpBooks(a, b) * (sortingReversed ? -1 : 1);
    };

    const cmpBooks = (b1: ReadingListItemType, b2: ReadingListItemType) => {
        switch (selectedSort) {
            case "date_created":
                return b1.createdAt.getTime() - b2.createdAt.getTime();

            case "author":
                return b1.book.author.localeCompare(b2.book.author);

            case "title":
                return b1.book.name.localeCompare(b2.book.name);

            case "rating":
                return (b1.rating?.stars ?? 0) - (b2.rating?.stars ?? 0);

            case "date_read":
            default:
                return sortReadingActivity(b1, b2) * -1;
        }
    };

    // apply filter
    async function setParamsFromFilter() {
        console.log("filter");

        let params = page.url.searchParams;
        params = inputParams.setParams(params);

        await goto("?" + params.toString(), {
            noScroll: true,
        });
    }

    const resetFilter = () => {
        // const params = page.url.searchParams;

        // // remove all filter params and only copy over query and sorting order
        // const new_params = new URLSearchParams(
        //     [...params].filter(([key]) => ["q", "order"].includes(key)),
        // );

        // new_params.set("filter", "true");

        // goto("?" + new_params.toString(), {
        //     noScroll: true,
        // });
        inputParams = FilterParams.fromParams(new URLSearchParams());
    };

    function parseDateInput(event: Event) {
        if (event.target !== null) {
            return new Date((event.target as HTMLDataElement).value);
        } else {
            return new Date(0);
        }
    }

    const filterMonth = (offset: number) => {
        inputParams.start_date = new Date();
        inputParams.start_date.setMonth(
            inputParams.start_date.getMonth() - offset,
        );
        inputParams.start_date.setDate(1);
        inputParams.start_date?.setHours(0, 0, 0, 0);

        inputParams.end_date = new Date();
        inputParams.end_date.setMonth(
            inputParams.end_date.getMonth() - offset + 1,
        ); // one month to much
        inputParams.end_date.setDate(0); // => set to last day of previous month
        inputParams.end_date?.setHours(0, 0, 0, 0);
    };

    const filterLastMonth = () => {
        filterMonth(1);
    };

    const filterThisMonth = () => {
        filterMonth(0);
    };

    const filterYear = (offset: number) => {
        inputParams.start_date = new Date();
        inputParams.start_date.setFullYear(
            inputParams.start_date.getFullYear() - offset,
        );
        inputParams.start_date.setDate(1);
        inputParams.start_date.setMonth(0);
        inputParams.start_date?.setHours(0, 0, 0, 0);

        inputParams.end_date = new Date();
        inputParams.end_date.setFullYear(
            inputParams.end_date.getFullYear() - offset,
        );
        inputParams.end_date.setDate(0); // calculates last day
        inputParams.end_date.setMonth(11);
        inputParams.end_date?.setHours(0, 0, 0, 0);
    };

    const filterLastYear = () => {
        filterYear(1);
    };

    const filterThisYear = () => {
        filterYear(0);
    };

    const changeLangFilter = (e: Event) => {
        inputParams.lang = (e.target as HTMLSelectElement).value;
    };

    const changeCatFilter = (selected: string[]) => {
        // to prevent infinite loop, because AutoComplete calls onChange when selectedItem is changed, and we also change selectedItem when params change
        if (selected == inputParams.categories) {
            return;
        }
        inputParams.categories = selected;
    };
    let has_active = $derived(
        $searchStore.data.length > 0 &&
            Object.prototype.hasOwnProperty.call(
                $searchStore.data[0],
                "active",
            ),
    );
</script>

<div class="mt-4 mb-8">
    <div class="grid grid-cols-1 gap-6">
        <details
            class="flex flex-col"
            open={!!params.get("order") || !!params.get("sort")}>
            <summary class="text-2xl">
                <div class="inline-flex items-center gap-2">
                    Sorting
                    <span class="inline-block w-5">
                        {#if sortingReversed}
                            <SortDesc />
                        {:else}
                            <SortAsc />
                        {/if}
                    </span>
                </div>
            </summary>
            <div class="flex gap-2 mt-2">
                <select
                    class="default-border border-red-600 border"
                    bind:value={selectedSort}
                    onchange={sortBooks}
                    aria-label="Sort by">
                    <option value="date_read">Sort by date</option>
                    <option value="date_created">Sort by date created</option>
                    <option value="title">Sort by title</option>
                    <option value="author">Sort by author</option>
                    <option value="rating">Sort by rating</option>
                </select>
                <SortOrder
                    bind:reversed={sortingReversed}
                    onClick={sortBooks} />
            </div>
        </details>

        <details class="flex flex-col" open={!!params.get("filter")}>
            <summary class="text-2xl">
                <div class="inline-flex items-center gap-2">
                    Filter
                    <span class="inline-block w-4">
                        <FilterIcon />
                    </span>
                </div>
            </summary>
            <div
                class="flex flex-col flex-wrap gap-2.5 mt-2 md:justify-between">
                {#if has_active}
                    <div class="flex flex-row items-center gap-1">
                        <label for="" class="whitespace-nowrap">
                            Show only active/latest or also old entries
                        </label>
                        <ToggleGroup
                            options={["only active", "all"]}
                            wrapperClass="w-full"
                            groupClass="flex mx-auto"
                            btnClass="px-4 py-1 border border-s-0 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 flex items-center gap-1"
                            btnSelectedClass="dark:bg-slate-700 bg-gray-50"
                            startClass="border-s rounded-s-md"
                            endClass="rounded-e-md"
                            bind:selectedOption={
                                inputParams.show_active_or_all
                            } />
                    </div>
                {/if}

                <label class="flex flex-col" id="rating-label">
                    <div class="flex gap-2">
                        Rating ({inputParams.rating} / {MAX_RATING})
                        <ClearButton
                            bind:value={inputParams.rating}
                            clearSelection={() =>
                                (inputParams.rating = undefined)} />
                    </div>
                    <div class="my-2" hidden={true}>
                        <!-- TODO -->
                        <EqRelation />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={MAX_RATING}
                        bind:value={inputParams.rating}
                        aria-labelledby="rating-label" />
                </label>

                <label class="flex flex-col">
                    Languages
                    <select
                        class="default-border input-color-1"
                        onchange={changeLangFilter}
                        value={inputParams.lang}>
                        <option value="all" selected>all</option>
                        {#each languages_used as lang}
                            <option value={lang}>{lang}</option>
                        {/each}
                    </select>
                </label>

                <label class="flex flex-col">
                    Categories {category_names.length == 0 ? "(empty)" : ""}
                    <!-- <AutoComplete
                        disabled={category_names.length == 0}
                        items={category_names}
                        selectedItem={inputParams.categories}
                        onChange={changeCatFilter}
                        multiple={true}
                        create={false}
                        id="categories"
                        name="categories"
                        class="input dark:bg-slate-600 dark:border-slate-500 my-2"
                        className="!h-full" /> -->
                </label>

                <label class="flex flex-col">
                    Start date
                    <input
                        type="date"
                        class="default-border input-color-1"
                        value={inputParams.start_date &&
                            dateToYYYY_MM_DD(inputParams.start_date)}
                        onchange={(e) =>
                            (inputParams.start_date = parseDateInput(e))} />
                </label>

                <label class="flex flex-col">
                    End date
                    <input
                        type="date"
                        class="default-border input-color-1"
                        value={inputParams.end_date &&
                            dateToYYYY_MM_DD(inputParams.end_date)}
                        onchange={(e) =>
                            (inputParams.end_date = parseDateInput(e))} />
                </label>

                <div class="flex justify-center gap-2">
                    <button class="btn-generic" onclick={filterLastMonth}>
                        Last month
                    </button>
                    <button class="btn-generic mr-4" onclick={filterThisMonth}>
                        This month
                    </button>
                    <button class="btn-generic" onclick={filterLastYear}>
                        Last year
                    </button>
                    <button class="btn-generic" onclick={filterThisYear}>
                        This year
                    </button>
                </div>
            </div>
            <div class="w-full md:w-fit flex gap-2 self-end mt-2">
                <button
                    class="btn-secondary-black block my-3 px-8 text-center w-full md:w-fit"
                    onclick={resetFilter}>
                    Reset
                </button>
                <button
                    class="btn-primary-black block my-3 px-8 text-center w-full md:w-fit"
                    onclick={async () => await setParamsFromFilter()}>
                    Filter
                </button>
            </div>
        </details>
    </div>
</div>
