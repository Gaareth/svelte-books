<script>
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
  import CancelRounded from "$lib/icons/CancelRounded.svelte";
  import { twMerge } from "tailwind-merge";
  export let className = "group p-2 !border-0 ";
</script>

<button
  class={twMerge("btn-delete", className)}
  title="did not finish book"
  name="targetStatus"
  value={READING_ACTIVITY_TYPES.DID_NOT_FINISH}
  type="submit">
  <span
    class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
    <CancelRounded alt="close mark" />
  </span>
</button>
