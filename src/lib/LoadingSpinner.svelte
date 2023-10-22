<script lang="ts">
  import { Moon } from "svelte-loading-spinners";
  import { theme } from "./stores/stores";
  import { isDarkModeEnabled } from "./utils";
  
  export let color: string | undefined = undefined;
  $: themedColor = isDarkModeEnabled($theme, window) ? "white" : "black";
  
</script>

<Moon
  size="20"
  color={color ??  themedColor}
  duration="1s"
/>
