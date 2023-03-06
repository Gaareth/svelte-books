<script lang="ts">
  import Modal from "./Modal.svelte";

  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  // enum MsgType {
  //   Info,
  //   Warning,
  //   Error,
  // }
  type MsgType = "Info" | "Warning" | "Error";

  export let type: MsgType;
  export let message: string;
  export let content: string;
  export let btn1_msg: string;
  export let btn2_msg: string;

  export let showModal = false;

  function getColor() {
    if (type == "Info") {
      return "bg-blue-400";
    } else if (type == "Warning") {
      return "bg-yellow-400";
    } else {
      return "bg-red-400";
    }
  }
</script>

<Modal bind:showModal>
  <div class="flex items-center gap-4" slot="header">
    <span class="shrink-0 rounded-full p-2 text-white {getColor()}" />
    <p class="font-medium sm:text-lg">{message}</p>
  </div>

  <p class="mt-4 text-gray-500">
    {content}
  </p>

  <div class="mt-6 sm:flex sm:gap-4">
    <button
      class="inline-block w-full rounded-lg {getColor()} px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
      on:click={() => dispatch("primary")}
    >
      {btn1_msg}
    </button>

    <button
      class="mt-2 inline-block w-full rounded-lg bg-gray-100 px-5 py-3 text-center text-sm text-gray-500 sm:mt-0 sm:w-auto"
      on:click={() => showModal = !showModal}
    >
      {btn2_msg}
    </button>
  </div>
</Modal>
