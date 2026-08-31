<script lang="ts">
    import toast from "svelte-french-toast";

    import { type SSE_EVENT } from "$src/routes/book/api/update_all/sse";

    import { enhance } from "$app/forms";
    import LoadingSpinner from "$components/LoadingSpinner.svelte";
    import RefreshIcon from "$src/lib/icons/RefreshIcon.svelte";
    import type { settingsApiReloadResult } from "$src/routes/settings/apidata";

    interface Props {
        currentStatus: SSE_EVENT | undefined;
        evtSource: EventSource | undefined;
        form?: settingsApiReloadResult;
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
        if (currentStatus?.id == "reload") {
            loading = currentStatus!.msg != "done";
        }
    });
</script>

<div>
    <form
        action="?/reload"
        method="POST"
        class="flex flex-col sm:flex-row justify-between gap-2 items-start"
        use:enhance={() => {
            loading = true;

            return async ({ result, update }) => {
                await update();
                loading = false;

                // @ts-ignore
                if (result === undefined || result?.data! == null) {
                    return;
                }            

                // @ts-ignore
                const { success, booksUpdated } = result.data;

                if (success) {
                    toast.success(
                        `Successfully updated ${booksUpdated} entries`,
                    );
                } else if (booksUpdated == 0) {
                    toast.error("Failed updating books :(");
                }
                if (currentStatus) {
                    currentStatus.msg = "done";
                }
            };
        }}>
        <p>Update api data for all existing entries</p>
        <button
            type="submit"
            class="btn-generic flex items-center justify-center gap-2 flex-none w-full sm:w-fit"
            disabled={loading || disabled}>
            {#if loading}
                <LoadingSpinner />
                loading..
            {:else}
                <span class="w-[20px]">
                    <RefreshIcon />
                </span>
                Reload all
            {/if}
        </button>
    </form>
</div>

{#if form != null}
    <div class="default-border p-3 my-2">
        <p class="mb-2">Updated {form.booksUpdated} books</p>
        {#each form.diffs as diff (diff)}
            <div>
                <a class="hover:underline" href="/book/{diff.bookName}">
                    {diff.bookName}
                </a>
                -
                {diff.propName}: {diff.oldValue} --> {diff.newValue}
            </div>
        {:else}
            No changes found
        {/each}
    </div>
{/if}
