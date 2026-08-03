<script>
    import clsx from "clsx";

    //@ts-ignore
    import IoMdDoneAll from "svelte-icons/io/IoMdDoneAll.svelte";

    import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";

    export let className = "group p-2 !border-0 ";
</script>

<button
    class={clsx("btn-done", className)}
    title="done reading"
    name="targetStatus"
    value={READING_ACTIVITY_TYPES.FINISHED}
    type="submit">
    <span
        class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
        <IoMdDoneAll alt="check mark" />
    </span>
</button>
