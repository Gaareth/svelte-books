<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
    import NotStartedRounded from "$lib/icons/NotStartedRounded.svelte";
    interface Props {
        className?: string;
    }

    let { className = "group p-2 !border-0" }: Props = $props();
</script>

<button
    class={twMerge("btn-blue", className)}
    title="start reading"
    name="targetStatus"
    value={READING_ACTIVITY_TYPES.READING}
    type="submit">
    <span
        class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
        <NotStartedRounded alt="not started symbol" />
    </span>
</button>
