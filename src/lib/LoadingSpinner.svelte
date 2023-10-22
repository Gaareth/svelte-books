<script lang="ts">
  import { Moon } from "svelte-loading-spinners";
  import { theme } from "./stores/stores";
  import { isDarkModeEnabled } from "./utils";
  import { onMount } from "svelte";
  
  export let color: string | undefined = undefined;
  // $: themedColor = window !== undefined && isDarkModeEnabled($theme, window) ? "white" : "black";
  // onMount(() => {
  //   themedColor = isDarkModeEnabled($theme, window) ? "white" : "black";
  // })
  let themedColor = "black";
  
</script>

<Moon
  size="20"
  color={color ??  themedColor}
  duration="1s"
/>
