<script lang="ts">
    import toast from "svelte-french-toast";
    import { twMerge } from "tailwind-merge";

    import {
        SSE_EVENT_NAME,
        type SSE_EVENT,
    } from "$src/routes/book/api/update_all/sse";
    import type { ActionData, PageData } from "./$types.js";

    import { enhance } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import AddApiButton from "$components/composed/Settings/AddApiButton.svelte";
    import ApiResult from "$components/composed/Settings/ApiResult.svelte";
    import ReloadButton from "$components/composed/Settings/ReloadButton.svelte";
    import ToggleGroup from "$lib/components/input/ToggleGroup.svelte";
    import {
        PRIVATE,
        AUTHENTICATED,
        UNLISTED,
        PUBLIC,
        type VisibilityType,
        VISIBILITY_VALUES,
    } from "$lib/constants/enums";
    import { capitalize } from "$lib/utils/utils";
    import { resolve } from "$app/paths";
    import { onDestroy, onMount } from "svelte";
    import AddApiCover from "$src/lib/components/composed/Settings/AddApiCover.svelte";

    interface Props {
        form: ActionData;
        data: PageData;
    }

    let { form, data = $bindable() }: Props = $props();

    let currentStatus: SSE_EVENT | undefined = $state(undefined);
    let globalVisibility = $state(data.globalVisibility);
    let readingActivityLists = $state(data.readingActivityLists);

    //TODO: toast

    let allAsGlobal = $derived(
        readingActivityLists
            .map((v) => v.visibility)
            .filter((v) => v != null)
            .every((v) => v === globalVisibility),
    );

    function changeAllVisiblities(option: string) {
        for (let i = 0; i < readingActivityLists.length; i++) {
            if (VISIBILITY_VALUES.includes(option as VisibilityType)) {
                readingActivityLists[i].visibility = option as VisibilityType;
            }
        }
        readingActivityLists = [...readingActivityLists];
    }

    async function resetForm() {
        await invalidateAll();
        globalVisibility = data.globalVisibility;
        readingActivityLists = data.readingActivityLists;
    }

    $effect(() => {
        if (form?.success) {
            toast.success("Successfully applied changes");
        }
    });
    // $: sortedSupportedVisibilites = [PRIVATE, AUTHENTICATED, UNLISTED, PUBLIC]; //TODO: support unlisted
    let sortedSupportedVisibilites = [PRIVATE, AUTHENTICATED, PUBLIC];

    let evtSource: EventSource | undefined = $state();
    let reloadLoading: boolean = $state(false);
    let addLoading: boolean = $state(false);
    let addCoverLoading: boolean = $state(false);

    let anyLoading = $derived(reloadLoading || addLoading || addCoverLoading);

    onMount(() => {
        console.log("onMount");
        evtSource = new EventSource("/book/api/update_all/");
        evtSource.addEventListener(SSE_EVENT_NAME, (event) => {
            // console.log(event);

            if (event.data === "undefined") {
                currentStatus = undefined;
                return;
            }

            try {
                currentStatus = JSON.parse(decodeURIComponent(event.data));
            } catch (error) {
                console.error("Error parsing SSE event data:", error);
            }
            // console.log(currentStatus);
        });
    });

    onDestroy(() => {
        if (evtSource) {
            evtSource.close();
        }
    });
</script>

<h1 class="text-5xl my-4">Settings</h1>

<section>
    <h2>Visibility</h2>

    <form method="POST" action="?/editVisibility" use:enhance>
        <div
            class="gap-2 flex flex-wrap justify-between border generic-border p-4 items-center">
            <div class="max-w-72">
                <p>Global visibilty</p>
                <p class="text-secondary text-base break-words">
                    Define whether your <a
                        class="text-base underline"
                        href={resolve("/[[username]]", {
                            username: data.session?.user?.name!,
                        })}>
                        account page
                    </a>
                    is visible. Currently also applies to book pages.
                </p>
            </div>
            <div>
                <ToggleGroup
                    options={sortedSupportedVisibilites}
                    displayFn={capitalize}
                    btnClass="px-4 py-1 border border-s-0 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 flex items-center gap-1 break-all"
                    btnSelectedClass="dark:bg-slate-700 bg-gray-50"
                    startClass="border-s rounded-s-md"
                    endClass="rounded-e-md"
                    bind:selectedOption={globalVisibility}
                    onSelect={changeAllVisiblities}
                    defaultOption={globalVisibility == PRIVATE ? 0 : 1} />
                <!-- <input
          type="hidden"
          name="isPublic"
          value={data.globalVisibility == "public"} /> -->

                <input
                    type="hidden"
                    name="globalVisibility"
                    value={globalVisibility} />

                <p class="text-secondary text-base">
                    Info:
                    {#if globalVisibility == PRIVATE}
                        Only you have access
                    {:else if globalVisibility == AUTHENTICATED}
                        Access requires an account
                    {:else if globalVisibility == PUBLIC}
                        Everyone has access
                    {:else if globalVisibility == UNLISTED}
                        Only people with the link have access
                    {:else}
                        Unknown visibility
                    {/if}
                </p>

                {#if !allAsGlobal}
                    <p class="text-warning text-base -mb-1">
                        Warning: Atleast one list is different.
                    </p>
                {/if}
            </div>
        </div>

        <div class="mt-4 mb-2">
            <h3 class="text-2xl font-medium">Reading Activity Lists</h3>
            <p class="text-base text-secondary -mt-0.5">
                Define which reading activities are visible to others. Applies
                to complete lists and entries on book pages.
            </p>
        </div>
        <div class="flex flex-col gap-2">
            {#each readingActivityLists as list, i (list.id)}
                <div
                    class={twMerge(
                        "gap-2 flex flex-wrap justify-between border generic-border p-4 items-center",
                        readingActivityLists[i].visibility !=
                            globalVisibility &&
                            readingActivityLists[i].visibility &&
                            "border-warning",
                    )}>
                    <p>{capitalize(list.status)}</p>

                    <ToggleGroup
                        options={sortedSupportedVisibilites}
                        displayFn={capitalize}
                        btnClass="px-4 py-1 border border-s-0 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 flex items-center gap-1 break-all"
                        btnSelectedClass="dark:bg-slate-700 bg-gray-50"
                        startClass="border-s rounded-s-md"
                        endClass="rounded-e-md"
                        deselectable={true}
                        selectedOption={readingActivityLists[i].visibility}
                        onSelect={(value) => {
                            readingActivityLists[i].visibility =
                                value as VisibilityType;
                            readingActivityLists = [...readingActivityLists];
                        }} />
                    <input
                        type="hidden"
                        name={`readingActivityVisibility[${list.status}]`}
                        value={readingActivityLists[i].visibility} />
                </div>
            {/each}
        </div>
        <div class="mt-3 flex gap-2 justify-end">
            <button type="button" class="btn-generic" onclick={resetForm}>
                Cancel
            </button>
            <button
                type="submit"
                class="btn-primary-black w-36 flex justify-center">
                Save
            </button>
        </div>
    </form>
</section>

<section>
    <h2>
        Datasource
        <p class="text-base text-secondary -mt-0.5">
            Manage the api connections of all books.
        </p>
    </h2>

    <div class="flex flex-col gap-6 sm:gap-8">
        <ReloadButton
            bind:loading={reloadLoading}
            bind:currentStatus
            {evtSource}
            form={form?.diffs !== undefined ? form : undefined}
            disabled={anyLoading} />
        <AddApiButton
            bind:loading={addLoading}
            bind:currentStatus
            {evtSource}
            form={form?.type === "try_add" ? form : undefined}
            disabled={anyLoading} />

        <AddApiCover
            bind:loading={addCoverLoading}
            bind:currentStatus
            {evtSource}
            form={form?.type === "add_cover" ? form : undefined}
            disabled={anyLoading} />

        <ApiResult {currentStatus} />
    </div>
    <!-- SOON -->
</section>

<style>
    h2 {
        margin: 1rem 0;
        font-size: 1.75rem;
        line-height: 2rem;
        /* font-weight: bold; */
    }
</style>
