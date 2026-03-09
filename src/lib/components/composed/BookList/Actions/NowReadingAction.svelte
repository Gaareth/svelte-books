<script>
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
  import NotStartedRounded from "$lib/icons/NotStartedRounded.svelte";
</script>

<button
  class="group p-2 !border-0 btn-blue"
  title="start reading"
  name="targetStatus"
  value={READING_ACTIVITY_TYPES.READING}
  type="submit">
  <span
    class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
    <NotStartedRounded alt="not started symbol" />
  </span>
</button>

<style lang="postcss">
  .btn-blue {
    @apply focus:relative bg-blue-600 hover:bg-blue-700 active:bg-blue-800
      dark:bg-blue-500 dark:hover:bg-blue-600 dark:active:bg-blue-700 dark:text-blue-100 text-white;
  }
</style>
