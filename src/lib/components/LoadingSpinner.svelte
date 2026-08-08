<script lang="ts">
    import { Moon } from "svelte-loading-spinners";

    import { theme } from "$lib/stores/stores";

    interface Props {
        color?: string | undefined;
    }

    let { color = undefined }: Props = $props();
    let themedColor = $derived($theme == "dark" ? "white" : "black");
</script>

<Moon size="20" color={color ?? themedColor} duration="1s" />
