<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import clsx from "clsx";
    //@ts-ignore
    import IoMdDoneAll from "svelte-icons/io/IoMdDoneAll.svelte";

    import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";

    interface Props {
        className?: string;
    }

    let { className = "group p-2 !border-0 " }: Props = $props();

    const dispatch = createEventDispatcher();
</script>

<button
    class={clsx("btn-done", className)}
    title="done reading"
    name="targetStatus"
    value={READING_ACTIVITY_TYPES.FINISHED}
    type="button"
    onclick={() => dispatch("done")}>
    <span
        class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
        <IoMdDoneAll alt="check mark" />
    </span>
</button>
