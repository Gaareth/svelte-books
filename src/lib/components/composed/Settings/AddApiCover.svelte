<script lang="ts">
    import toast from "svelte-french-toast";

    import { type SSE_EVENT } from "$src/routes/book/api/update_all/sse";

    import { enhance } from "$app/forms";
    import LoadingSpinner from "$components/LoadingSpinner.svelte";
    import RefreshIcon from "$src/lib/icons/RefreshIcon.svelte";
    import type {
        settingsApiAddCoverResult,
    } from "$src/routes/settings/apidata";
    import ApiResultWithErrors from "./ApiResultWithErrors.svelte";

    interface Props {
        currentStatus: SSE_EVENT | undefined;
        evtSource: EventSource | undefined;
        form?: settingsApiAddCoverResult;
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
        if (currentStatus?.id == "add_cover") {
            loading = currentStatus!.msg != "done";
        }
    });
</script>

<div>
    <form
        action="?/add_cover"
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
                        `Successfully added cover for ${booksUpdated} books`,
                    );
                } else if (booksUpdated == 0) {
                    toast.error("Failed updating books :(");
                }
                if (currentStatus) {
                    currentStatus.msg = "done";
                }
            };
        }}>
        <div>
            <p>Add cover images to books with missing covers</p>
            <p class="text-base text-secondary -mt-0.5">
                Takes the highest quality image from the connected google books
                api entry.
            </p>
        </div>
        <button
            type="submit"
            class="btn-generic flex items-center justify-center gap-2 flex-none w-full sm:w-fit"
            disabled={loading || disabled}>
            {#if loading}
                <LoadingSpinner />
                adding covers..
            {:else}
                <span class="w-[20px]">
                    <RefreshIcon />
                </span>
                Add covers
            {/if}
        </button>
    </form>
</div>

<ApiResultWithErrors {form} />
