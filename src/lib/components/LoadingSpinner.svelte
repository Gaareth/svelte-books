<script lang="ts">
  import { Moon } from "svelte-loading-spinners";
  import { theme } from "$lib/stores/stores";

  export let color: string | undefined = undefined;
  $: themedColor = $theme == "dark" ? "white" : "black";
</script>

<Moon size="20" color={color ?? themedColor} duration="1s" />
