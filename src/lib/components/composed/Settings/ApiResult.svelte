<script lang="ts">
    import ProgressBar from "../../ProgressBar.svelte";
    import { type SSE_EVENT } from "$src/routes/book/api/update_all/sse";

    interface Props {
        currentStatus: SSE_EVENT | undefined;
    }

    let { currentStatus }: Props = $props();
</script>

{#if currentStatus !== undefined && currentStatus.msg != "done"}
    <ProgressBar
        msg={currentStatus.msg}
        value={currentStatus.items}
        max={currentStatus.max} />
{/if}
