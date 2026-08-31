<script lang="ts">
    import toast, { ErrorIcon } from "svelte-french-toast";
    import type { SSE_EVENT } from "$src/routes/book/api/update_all/sse";
    import { enhance } from "$app/forms";
    import LoadingSpinner from "$components/LoadingSpinner.svelte";
    import AddIcon from "$src/lib/icons/AddIcon.svelte";
    import type { settingsApiCreateResult } from "$src/routes/settings/apidata";
    import SuccessIcon from "$src/lib/icons/SuccessIcon.svelte";

    interface Props {
        currentStatus: SSE_EVENT | undefined;
        evtSource: EventSource | undefined;
        form?: settingsApiCreateResult;
        disabled?: boolean;
        loading?: boolean;
    }

    let {
        currentStatus = $bindable(),
        evtSource = $bindable(),
        form,
        disabled = false,
        loading = $bindable(false),
    }: Props = $props();

    $effect(() => {
        if (currentStatus?.id == "try_add") {
            loading = currentStatus!.msg != "done";
        }
    });
</script>

<form
    class="flex flex-col sm:flex-row justify-between gap-2 items-start"
    action="?/try_add"
    method="POST"
    use:enhance={() => {
        loading = true;

        return async ({ result, update }) => {
            // i need update to get the form data,
            // this results in a network error? for a second
            await update();
            loading = false;

            // @ts-ignore
            if (result === undefined || result?.data! == null) {
                return;
            }

            // @ts-ignore
            const { success, updatedBookNames, errorsBooks } = result.data;

            if (success) {
                toast.success(
                    `Successfully added ${updatedBookNames.length} new entries`,
                );
            } else if (updatedBookNames.length == 0) {
                toast.error("Failed updating any book :(");
            } else {
                toast(
                    `Updated ${updatedBookNames.length} books and failed in ${errorsBooks.length}`,
                    {
                        icon: "⚠️",
                    },
                );
            }
            if (currentStatus) {
                currentStatus.msg = "done";
            }
        };
    }}>
    <div class="flex flex-wrap items-center w-full gap-1">
        <div>
            <p>Try add api info to all books</p>
            <label class="flex flex-col">
                <div class="flex items-center gap-3">
                    <p class="text-lg">Reconnect:</p>
                    <input type="checkbox" name="connect-all" class="" />
                </div>
                <p class="text-secondary text-base -mt-0.5">
                    (might change api entry if it already has an connection)
                </p>
            </label>
        </div>

        <button
            type="submit"
            class="btn-generic flex items-center justify-center gap-2 flex-none w-full sm:w-fit ml-auto"
            disabled={loading || disabled}>
            {#if loading}
                <LoadingSpinner />
                loading..
            {:else}
                <span class="w-[20px]"><AddIcon /></span>
                Add API connections
            {/if}
        </button>
    </div>
</form>

{#if form != null && form.errorsBooks !== undefined}
    <div class="default-border p-3 my-2">
        {#if form.errorsBooks.length > 0}
            <span class="inline-flex gap-1 mb-2">
                Finished updating all {form.updatedBookNames.length} entries.
                <span class="text-red-500 inline-flex items-center gap-1">
                    <span class="w-[20px] inline-block">
                        <ErrorIcon />
                    </span>
                    Failed in {form.errorsBooks.length} entries
                </span>
            </span>

            <div>
                {#each form.errorsBooks as errorBook (errorBook)}
                    <div class="flex items-center gap-2">
                        <span class="w-[20px] inline-block text-red-500">
                            <ErrorIcon />
                        </span>
                        <a
                            class="hover:underline"
                            href="/book/{errorBook.book.name}">
                            {errorBook.book.name}
                        </a>
                        -
                        {#if errorBook.volumeId !== undefined}
                            <a
                                class="hover:underline"
                                href="http://books.google.de/books?id={errorBook.volumeId}">
                                volumeId: {errorBook.volumeId}
                            </a>
                        {/if}
                        -
                        <span class="text-red-500 font-bold">
                            Error: {errorBook.error}
                        </span>
                    </div>
                {/each}
            </div>
        {:else}
            <span class="inline-flex gap-1 flex-wrap">
                <span
                    class="text-green-500 dark:text-green-400 inline-flex items-center gap-1">
                    <span class="w-[22px] inline-block">
                        <SuccessIcon />
                    </span>
                    Successfully
                </span>
                updated all {form.updatedBookNames.length}
                entries
            </span>
            <details open>
                <summary>Books updated:</summary>
                <ul class="list-disc">
                    {#each form.updatedBookNames as name (name)}
                        <li class="ml-10">
                            <a
                                class="hover:underline text-base"
                                href="/book/{name}">
                                {name}
                            </a>
                        </li>
                    {/each}
                </ul>
            </details>
        {/if}
    </div>
{/if}
