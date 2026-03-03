<script lang="ts">
  import { onMount } from "svelte";
  import { Moon } from "svelte-loading-spinners";
  import { theme } from "./stores/stores";

  export let color: string | undefined = undefined;
  $: themedColor = $theme == "dark" ? "white" : "black";
</script>

<Moon size="20" color={color ?? themedColor} duration="1s" />
