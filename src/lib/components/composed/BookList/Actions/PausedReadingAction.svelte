<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
    import PauseCircleRounded from "$lib/icons/PauseCircleRounded.svelte";
    interface Props {
        className?: string;
    }

    let { className = "group p-2 !border-0 " }: Props = $props();
</script>

<button
    class={twMerge("btn-warn", className)}
    title="paused book"
    name="targetStatus"
    value={READING_ACTIVITY_TYPES.PAUSED}
    type="submit">
    <span
        class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
        <PauseCircleRounded alt="pause symbol" />
    </span>
</button>
