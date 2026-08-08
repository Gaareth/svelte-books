<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import clsx from "clsx";

    import Modal from "./Modal.svelte";

    const dispatch = createEventDispatcher();

    type MsgType = "Info" | "Warning" | "Error";

    interface Props {
        type: MsgType;
        message: string;
        content: import("svelte").Snippet;
        btn1_msg: string;
        btn2_msg: string;
        showModal?: boolean;
    }

    let {
        type,
        message,
        content,
        btn1_msg,
        btn2_msg,
        showModal = $bindable(false),
    }: Props = $props();

    function getColor() {
        if (type == "Info") {
            return "bg-blue-400";
        } else if (type == "Warning") {
            return "bg-yellow-400";
        } else {
            return "bg-red-400";
        }
    }

    function getBorderColor() {
        if (type == "Info") {
            return "border-blue-400 hover:border-blue-500 hover:dark:border-blue-300";
        } else if (type == "Warning") {
            return "border-yellow-400 hover:border-yellow-500 hover:dark:border-yellow-300";
        } else {
            return "border-red-400 hover:border-red-500 hover:dark:border-red-300";
        }
    }
</script>

<Modal bind:showModal>
    {#snippet header()}
        <div class="flex items-center gap-4">
            <span class="shrink-0 rounded-full p-2 text-white {getColor()}"></span>
            <p class="font-medium sm:text-lg">{message}</p>
        </div>
    {/snippet}

    <div class="mt-4 text-gray-500 dark:text-white">
        {@render content()}
    </div>

    <div class="mt-6 sm:flex sm:gap-4">
        <button
            class={clsx(
                getColor(),
                getBorderColor(),
                "border inline-block w-full rounded-md px-5 py-2 text-center text-sm font-semibold text-white sm:w-auto",
            )}
            type="button"
            onclick={() => dispatch("primary")}>
            {btn1_msg}
        </button>

        <button
            class="mt-2 inline-block w-full rounded-md bg-gray-100 px-5 py-2 text-center text-sm text-gray-500 sm:mt-0 sm:w-auto border border-gray-200 hover:border-gray-300
      dark:bg-slate-600 dark:text-white dark:border-slate-500 dark:hover:bg-slate-500"
            onclick={() => {
                showModal = false;
            }}
            type="button">
            {btn2_msg}
        </button>
    </div>
</Modal>
