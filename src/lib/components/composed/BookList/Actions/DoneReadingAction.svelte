<script lang="ts">

    import clsx from "clsx";
    import IoMdDoneAll from "svelte-icons/io/IoMdDoneAll.svelte";

    import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";

    interface Props {
        className?: string;
        onClick?: () => void;
    }

    let { className = "group p-2 !border-0 ", onClick }: Props = $props();

</script>

<button
    class={clsx("btn-done", className)}
    title="done reading"
    name="targetStatus"
    value={READING_ACTIVITY_TYPES.FINISHED}
    type="button"
    onclick={onClick}>
    <span
        class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
        <IoMdDoneAll alt="check mark" />
    </span>
</button>
