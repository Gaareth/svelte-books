<script>
  import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";

  //@ts-ignore
  import IoMdDoneAll from "svelte-icons/io/IoMdDoneAll.svelte";
</script>

<button
  class="group p-2 !border-0 btn-done"
  title="done reading"
  name="targetStatus"
  value={READING_ACTIVITY_TYPES.FINISHED}
  type="submit">
  <span
    class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
    <IoMdDoneAll alt="check mark" />
  </span>
</button>
