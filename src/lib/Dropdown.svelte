<script lang="ts">
  import clsx from "clsx";
  import { twMerge } from "tailwind-merge";
  import { clickOutside } from "./clickOutside";

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

<div class="dropdown">
  <span>Mouse over me</span>
  <div class="dropdown-content">
    <p>Hello World!</p>
  </div>
</div>

<div class="dropdown" use:clickOutside on:click_outside={click_outside}>
  <button class="dropdown-btn flex" on:click={toggleOpen} bind:this={button_ref}>
    <slot name="button" />
  </button>
  <div
    class={clsx("dropdown-content", open == false ? "hidden-imp" : "")}
    on:click={click_outside}
    on:keydown
  >
    <slot name="dropdown" />
  </div>
</div>

<style>
  .hidden-imp {
    visibility: hidden !important;
    transform: translateY(20px) !important;
    opacity: 0;
    transition: visibility 0s 2s, opacity 2s linear;
  }

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    left: -100%;
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

    transform: translateY(20px);

    transition: all 150ms linear;
  }

  .dropdown:focus-within .dropdown-content {
    visibility: visible;
    transform: translateY(0);
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
