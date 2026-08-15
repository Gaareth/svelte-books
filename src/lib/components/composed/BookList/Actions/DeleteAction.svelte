<script lang="ts">
    import DeleteIcon from "$src/lib/icons/DeleteIcon.svelte";

    interface Props {
        onClick?: () => void;
    }

    let { onClick }: Props = $props();
</script>

<button
    class="group p-2 btn-delete hidden sm:inline-block !border-0"
    title="Delete book"
    type="button"
    onclick={onClick}>
    <span
        class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
        <DeleteIcon alt="red trash can" />
    </span>
</button>
