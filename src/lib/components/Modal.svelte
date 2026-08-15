<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { preventDefault } from "../utils/event-modifers";
    import CloseIcon from "../icons/CloseIcon.svelte";

    interface Props {
        showModal: boolean;
        className?: string | undefined;
        divClassName?: string | undefined;
        showDividers?: boolean;
        header?: import("svelte").Snippet;
        children?: import("svelte").Snippet;
        onOpened?: () => void;
        onClosed?: () => void;
    }

    let {
        showModal = $bindable(),
        className = undefined,
        divClassName = undefined,
        showDividers = true,
        header,
        children,
        onOpened,
        onClosed,
    }: Props = $props();

    let dialog: HTMLDialogElement | undefined = $state();

    $effect(() => {
        if (dialog && showModal) {
            dialog.showModal();
            onOpened?.();
        }
    });
    $effect(() => {
        if (!showModal && !!dialog) {
            dialog.close();
            onClosed?.();
        }
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- eslint-disable-next-line svelte/valid-compile -->
<dialog
    bind:this={dialog}
    onclose={preventDefault(() => {
        showModal = false;
    })}
    onclick={() => {
        dialog?.close();
    }}
    class={twMerge(
        "rounded-md border border-blue-100 bg-white dark:border-slate-700 dark:bg-slate-700 dark:text-white shadow-lg p-2 lg:p-4",
        className,
    )}
    role="alertdialog">
    <div
        onclick={(event) => {
            // prevent modal from closing when clicking inside the modal content
            event.stopPropagation();
        }}
        class={divClassName}>
        <div class="flex justify-between item-center gap-3">
            {@render header?.()}
        </div>
        <!-- svelte-ignore a11y_autofocus -->
        <button
            autofocus
            onclick={preventDefault(() => {
                dialog?.close();
            })}
            title="Close modal"
            class="!flex items-center absolute top-2 right-2">
            <span class="w-[24px] h-[24px] inline-block hover:text-error">
                <CloseIcon />
            </span>
        </button>

        <hr class="dark:border-slate-600" hidden={!showDividers} />
        {@render children?.()}
        <hr class="mt-4 dark:border-slate-600" hidden={!showDividers} />
    </div>
</dialog>

<style>
    dialog::backdrop {
        background: rgba(0, 0, 0, 0.3);
    }

    dialog[open] {
        animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes zoom {
        from {
            transform: scale(0.95);
        }
        to {
            transform: scale(1);
        }
    }
    dialog[open]::backdrop {
        animation: fade 0.2s ease-out;
    }
    @keyframes fade {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    button {
        display: block;
    }
</style>
