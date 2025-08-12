<script lang="ts">
  import { createEventDispatcher } from "svelte";

  //@ts-ignore
  import IoMdClose from "svelte-icons/io/IoMdClose.svelte";
  import { twMerge } from "tailwind-merge";

  export let showModal: boolean;
  export let className: string | undefined = undefined;
  export let divClassName: string | undefined = undefined;

  export let showDividers = true;

  let dialog: HTMLDialogElement;

  const dispatch = createEventDispatcher();

  $: if (dialog && showModal) {
    dialog.showModal();
    dispatch("opened");
  }
  $: if (!showModal && !!dialog) {
    dialog.close();
    dispatch("closed");
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- eslint-disable-next-line svelte/valid-compile -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close|preventDefault={() => {
    showModal = false;
  }}
  on:click|self={() => dialog.close()}
  class={twMerge(
    "rounded-md border border-blue-100 bg-white dark:border-slate-700 dark:bg-slate-700 dark:text-white shadow-lg p-2 sm:p-2 lg:p-4",
    className
  )}
  role="alertdialog"
>
  <div on:click|stopPropagation class={divClassName}>
    <div class="flex justify-between item-center gap-3">
      <slot name="header" />
    </div>
    <!-- svelte-ignore a11y-autofocus -->
    <button
      autofocus
      on:click|preventDefault={() => {
        dialog.close();
      }}
      title="Close modal"
      class="!flex items-center absolute top-2 right-2"
    >
      <span class="w-[24px] h-[24px] inline-block hover:text-error">
        <IoMdClose />
      </span>
    </button>
    <hr class="dark:border-slate-600" hidden={!showDividers} />

    <slot />
    <hr class="mt-4 dark:border-slate-600" hidden={!showDividers} />
  </div>
</dialog>

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
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
