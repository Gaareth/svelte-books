<script lang="ts">
    import ErrorIcon from "$src/lib/icons/ErrorIcon.svelte";
    import SuccessIcon from "$src/lib/icons/SuccessIcon.svelte";
    import type { settingsApiWithErrorsResult } from "$src/routes/settings/apidata";

    interface Props {
        form?: settingsApiWithErrorsResult | undefined;
    }

    let { form }: Props = $props();
</script>

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
