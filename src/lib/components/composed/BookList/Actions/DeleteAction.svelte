<script lang="ts">
  import { createEventDispatcher } from "svelte";
  //@ts-ignore
  import IoMdTrash from "svelte-icons/io/IoMdTrash.svelte";

  const dispatch = createEventDispatcher();
</script>

<button
  class="group p-2 btn-delete hidden sm:inline-block !border-0"
  title="Delete book"
  type="button"
  on:click={() => {
    dispatch("delete");
  }}>
  <span
    class="block w-5 group-hover:animate-drop-hover group-active:animate-drop-click">
    <IoMdTrash alt="red trash can" />
  </span>
</button>
