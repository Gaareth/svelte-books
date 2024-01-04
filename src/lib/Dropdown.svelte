<script lang="ts">
  import clsx from "clsx";
  import { clickOutside } from "./clickOutside";
  import { twMerge } from "tailwind-merge";

  export let buttonClass: string | undefined = undefined;

  let open: boolean | undefined = undefined;
  let button_ref: HTMLElement;

  const toggleOpen = () => {
    button_ref.focus();

    open = !open;
  };

  const click_outside = () => {
    open = false;
  };
</script>

<div class="dropdown" use:clickOutside on:click_outside={click_outside}>
  <button
    class={twMerge("dropdown-btn flex      focus:ring-2", buttonClass)}
    type="button"
    on:click={toggleOpen}
    bind:this={button_ref}
  >
    <slot name="button" />
  </button>
  <div
    class={clsx("dropdown-content", open == false ? "hidden-imp" : "")}
    on:click={click_outside}
    on:keydown
    role="button"
    tabindex=0
  >
    <slot name="dropdown" />
  </div>
</div>

<style>
  .hidden-imp {
    visibility: hidden !important;
    transform: translateX(-50%) translateY(20px) !important;
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
    visibility: hidden;
    /* display: none; */

    position: absolute;
    background-color: #f9f9f9;
    /* min-width: 60px; */
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    padding: 4px 0px;
    z-index: 100;
    border-radius: 0.25rem;
    border-width: 1px;

    transform: translateX(-50%) translateY(20px);

    transition: all 150ms linear;
  }

  .dropdown:focus-within .dropdown-content {
    visibility: visible;
    transform: translateX(-50%) translateY(10%);
  }

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
