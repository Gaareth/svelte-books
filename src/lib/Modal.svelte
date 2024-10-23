<script lang="ts">
  //@ts-ignore
  import IoMdClose from "svelte-icons/io/IoMdClose.svelte";

  export let showModal: boolean; 

  let dialog: HTMLDialogElement; 

  $: if (dialog && showModal) dialog.showModal();
  $: if (!showModal && !!dialog) dialog.close();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- eslint-disable-next-line svelte/valid-compile -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
  class="rounded-md border border-blue-100 bg-white dark:bg-slate-700 dark:text-white p-4 shadow-lg sm:p-6 lg:p-8"
  role="alertdialog"
>
  <div on:click|stopPropagation>
    <div class="flex justify-between item-center gap-3">
      <slot name="header" />
      <!-- svelte-ignore a11y-autofocus -->
      <button autofocus on:click={() => dialog.close()} title="Close modal" class="!flex items-center">
        <span class="w-[24px] h-[24px] inline-block">
          <IoMdClose />
        </span>
      </button>
    </div>
    <hr class="dark:border-slate-600"/>

    <slot/>
    <hr class="mt-4 dark:border-slate-600"/>
  </div>
</dialog>

<style>
  dialog {
    max-width: 32em;
    border-radius: 0.2em;
    border: none;
    padding: 0;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  button {
    display: block;
  }
</style>
