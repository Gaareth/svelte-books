<script lang="ts">
  import clsx from "clsx";
  import { clickOutside } from "./clickOutside";
  import { twMerge } from "tailwind-merge";
  import Modal from "./Modal.svelte";
  import { browser } from "$app/environment";
  import { onMount, onDestroy } from "svelte";

  export let className: string | undefined = undefined;
  export let buttonClass: string | undefined = undefined;
  export let contentClass: string | undefined = undefined;
  export let closeOnClick: boolean = true;

  export let open: boolean = false;
  let trigger_ref: HTMLElement;

  let showModal = false;
  let width: number;

  let dropdownWrapper: HTMLDivElement;
  let dropdownContentWrapper: HTMLDivElement;

  $: {
    if (browser) {
      // breakpoint: sm
      showModal = open && width < 640;
    }
  }

  onMount(() => {
    width = document.documentElement.clientWidth;
    window.addEventListener("resize", () => {
      width = document.documentElement.clientWidth;
      checkDropdownPosition();
    });
    window.addEventListener("scroll", checkDropdownPosition);
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("resize", checkDropdownPosition);
      window.removeEventListener("scroll", checkDropdownPosition);
    }
  });

  let openUpwards = false; // track dropdown direction
  function checkDropdownPosition() {
    if (!dropdownWrapper || !dropdownContentWrapper || showModal) return;

    const triggerRect = dropdownWrapper.getBoundingClientRect();
    const dropdownHeight = dropdownContentWrapper.scrollHeight + 75;

    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    openUpwards = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
  }

  const toggleOpen = () => {
    // trigger_ref.focus();

    open = !open;
    if (open) {
      checkDropdownPosition();
    }
  };

  const click_outside = () => {
    if (!showModal) {
      open = false;
    }
  };
</script>

<div
  class={twMerge("dropdown", className)}
  use:clickOutside
  on:click_outside={click_outside}
  bind:this={dropdownWrapper}
>
  <div>
    <slot name="triggerWrapper">
      <button
        class={twMerge("dropdown-btn flex focus:ring-2", buttonClass)}
        on:click={toggleOpen}
        bind:this={trigger_ref}
        type="button"
      >
        <slot name="triggerContent" />
      </button>
    </slot>
  </div>

  <div
    class={clsx(
      "dropdown-content",
      open == false ? "hidden-imp" : "",
      "hidden sm:block",
      contentClass
    )}
    style={openUpwards
      ? `
      transform:  translateX(-50%) translateY(-${
        (dropdownWrapper?.clientHeight ?? 0) + 10
      }px); 
      bottom: 0;
    `
      : ""}
    on:click={(e) => {
      e.preventDefault();
      if (closeOnClick) {
        click_outside();
      }
    }}
    on:keydown
    role="button"
    tabindex="0"
    bind:this={dropdownContentWrapper}
  >
    <slot name="dropdown" />
  </div>
</div>

<Modal bind:showModal showDividers={false} divClassName="!p-0">
  <slot name="dropdown" />
</Modal>

<style>
  .hidden-imp {
    visibility: hidden !important;
    transform: translateX(-50%) translateY(0%) !important;
    opacity: 0;
    transition: visibility 0s 2s, opacity 2s linear;
  }

  .dropdown {
    position: relative;
    display: inline-block;
  }
  /* .dropdown-btn {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    outline: 0;
  } */

  .dropdown-content {
    left: 50%;
    /* visibility: hidden; */
    /* display: none; */

    position: absolute;
    background-color: #f9f9f9;
    /* min-width: 60px; */
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    padding: 4px 0px;
    z-index: 100;
    border-radius: 0.25rem;
    border-width: 1px;

    transform: translateX(-50%) translateY(15px);

    transition: all 150ms linear;
  }

  /* .dropdown:focus-within .dropdown-content {
    visibility: visible;
    transform: translateX(-50%) translateY(10%);
  } */

  :is(.dark .dropdown-content) {
    background-color: #374151;
    border-color: #475569;
  }

  /* .dropdown:hover .dropdown-content {
    visibility: visible;
    transform: translateY(0);

    display: block;
  } */
</style>
