<script lang="ts">
    import type { Prisma } from "$prismaBrowser";

    import { enhance } from "$app/forms";
    import EyePlus from "$lib/icons/eye-plus.svelte";
    import { copyToClipboard } from "$utils/browserUtils";
    import { deepClone } from "$utils/utils";
    import CopyOutlineRounded from "$src/lib/icons/CopyOutlineRounded.svelte";
    import DeleteIcon from "$src/lib/icons/DeleteIcon.svelte";
    import clsx from "clsx";

    type ServerSettings = Prisma.ServerSettingsGetPayload<{
        include: { registrationCodes: true };
    }>;
    interface Props {
        serverSettings: ServerSettings;
    }

    let { serverSettings }: Props = $props();
    let formValues = $derived(serverSettings);

    let registrationCodes = $derived(formValues.registrationCodes);
    let registrationPossible = $derived(formValues.registrationPossible);
</script>

<div class={clsx("gap-2 flex justify-between border generic-border p-4 items-center", registrationPossible && "border-warning" )}>
    <div>
        <label for="registrationOpen">Registration open</label>
        <p class="text-secondary text-base">
            {#if registrationPossible}
                <span class="text-warning text-base">Warning: Anyone can register.</span>
            {:else}
                 Registration is only possible with a registration code.
            {/if}
        </p>
    </div>

    <input
        type="checkbox"
        name="registrationOpen"
        id="registrationOpen"
        checked={registrationPossible}
        onchange={(e) => {
            registrationPossible = !registrationPossible;
            e.currentTarget.form?.requestSubmit();
        }}
        class="rounded" />
</div>

<div>
    <div class="flex justify-between">
        <h2 class="text-2xl">
            Registration codes ({registrationCodes.length})
        </h2>
        <button
            class="btn-generic px-5 sm:px-2 text-base"
            formaction="?/addRegistrationCode"
            type="submit">
            Add
        </button>
    </div>

    {#if registrationCodes.length > 0}
        <div class="flex flex-col gap-3 sm:gap-2 mt-3">
            {#each registrationCodes as code (code.code)}
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <a
                        href={`/register/${code.code}`}
                        class="underline-hover"
                        target="_blank">
                        {code.code}
                    </a>

                    <p
                        class="ml-5 text-secondary text-base flex items-center gap-1"
                        title="times used">
                        {code.timesUsed}
                        <span class="block w-4"><EyePlus /></span>
                    </p>

                    <div class="flex justify-end ms-2 sm:ms-0 sm:flex-1">
                        <span
                            class="inline-flex flex-row divide-x overflow-hidden rounded-md bg-white dark:bg-slate-700">
                            <button
                                class="group inline-block p-2 hover:bg-gray-50 focus:relative dark:hover:bg-slate-500"
                                title="copy"
                                type="button"
                                onclick={async () =>
                                    await copyToClipboard(
                                        code.code,
                                        "Copied registration code to clipboard",
                                    )}>
                                <span
                                    class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
                                    <CopyOutlineRounded alt="copy icon" />
                                </span>
                            </button>

                            <button
                                class="group p-2 btn-delete !border-0"
                                title="Delete code"
                                name="code"
                                value={code.code}
                                formaction="?/deleteRegistrationCode"
                                type="submit">
                                <span
                                    class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
                                    <DeleteIcon alt="red trash can" />
                                </span>
                            </button>
                        </span>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-secondary text-base">No codes added</p>
    {/if}
</div>
