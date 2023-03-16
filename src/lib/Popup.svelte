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

  function getColorVar() {
    if (type == "Info") {
      return "blue";
    } else if (type == "Warning") {
      return "yellow";
    } else {
      return "red";
    }
  }
</script>

<Modal bind:showModal>
  <div class="flex items-center gap-4" slot="header">
    <span class="shrink-0 rounded-full p-2 text-white {getColor()}" />
    <p class="font-medium sm:text-lg">{message}</p>
  </div>

  <p class="mt-4 text-gray-500 dark:text-white">
    {content}
  </p>

  <div class="mt-6 sm:flex sm:gap-4">
    <button
      class="inline-block w-full {getColor()} rounded-md px-5 py-2 text-center text-sm font-semibold text-white sm:w-auto
      border 
      dark:border-slate-400 dark:hover:border-slate-300 
      border-slate-400 hover:border-slate-500"
      on:click={() => dispatch("primary")}
    >
      {btn1_msg}
    </button>

    <button
      class="mt-2 inline-block w-full rounded-md bg-gray-100 px-5 py-2 text-center text-sm text-gray-500 sm:mt-0 sm:w-auto border border-gray-200 hover:border-gray-300
      dark:bg-slate-400 dark:text-white dark:border-slate-400 dark:hover:border-slate-300"
      on:click={() => {        
        showModal = false
      }}
    >
      {btn2_msg}
    </button>
  </div>
</Modal>
