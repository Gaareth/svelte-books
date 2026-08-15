<script lang="ts">
    import RemoveCircleIcon from "$src/lib/icons/RemoveCircleIcon.svelte";
    import { twMerge } from "tailwind-merge";



    interface Props {
        value: any | null | undefined;
        isValueNull?: boolean | undefined;
        clearSelection?: (() => void) | undefined;
    }

    let { value = $bindable(), isValueNull = undefined, clearSelection = undefined }: Props = $props();
    let hoverCss =
        $derived(!isValueNull && value != null
            ? "group-hover:animate-drop-hover group-active:animate-drop-click"
            : "text-neutral-500");
</script>

<button
    onclick={() => {
        if (clearSelection) {
            clearSelection();
        } else {
            value = null;
        }
    }}
    disabled={isValueNull}
    type="button"
    class="group flex"
    title="Clear Input">
    <span class={twMerge("inline-block w-5 group self-center", hoverCss)}>
        <RemoveCircleIcon />
    </span>
</button>
