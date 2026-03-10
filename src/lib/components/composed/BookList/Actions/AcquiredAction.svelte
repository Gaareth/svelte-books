<script>
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
  import BookInHouse from "$lib/icons/BookInHouse.svelte";
  import { twMerge } from "tailwind-merge";
  export let className = "group p-2 !border-0";
</script>

<button
  class={twMerge("btn-purple", className)}
  title="acquired book"
  name="targetStatus"
  value={READING_ACTIVITY_TYPES.ACQUIRED}
  type="submit">
  <span
    class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
    <BookInHouse alt="book in house" />
  </span>
</button>
