<script lang="ts">
    import toast from "svelte-french-toast";
    import type { SSE_EVENT } from "$src/routes/book/api/update_all/sse";
    import { enhance } from "$app/forms";
    import LoadingSpinner from "$components/LoadingSpinner.svelte";
    import AddIcon from "$src/lib/icons/AddIcon.svelte";
    import type { settingsApiCreateResult } from "$src/routes/settings/apidata";
    import ApiResultWithErrors from "./ApiResultWithErrors.svelte";

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
                adding..
            {:else}
                <span class="w-[20px]"><AddIcon /></span>
                Add API connections
            {/if}
        </button>
    </div>
</form>

<ApiResultWithErrors {form} />
