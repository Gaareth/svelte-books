<script>
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
  import NotStartedRounded from "$lib/icons/NotStartedRounded.svelte";
  import ReplayCircleFilled from "$lib/icons/ReplayCircleFilled.svelte";
  import { twMerge } from "tailwind-merge";
  export let className = "group p-2 !border-0";
</script>

<button
  class={twMerge("btn-blue", className)}
  title="continue reading"
  name="targetStatus"
  value={READING_ACTIVITY_TYPES.READING}
  type="submit">
  <span
    class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
    <ReplayCircleFilled alt="circular arrow in circle" />
  </span>
</button>
