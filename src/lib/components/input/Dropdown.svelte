<script lang="ts">
    import { createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    import { onMount, onDestroy } from "svelte";

    import clsx from "clsx";
    import { twMerge } from "tailwind-merge";

    import { browser } from "$app/environment";
    import { clickOutside } from "$components/input/clickOutside";
    import Modal from "$components/Modal.svelte";


  interface Props {
    className?: string | undefined;
    buttonClass?: string | undefined;
    contentClass?: string | undefined;
    closeOnClick?: boolean;
    open?: boolean;
    triggerWrapper?: import('svelte').Snippet;
    triggerContent?: import('svelte').Snippet;
    dropdown?: import('svelte').Snippet;
  }

  let {
    className = undefined,
    buttonClass = undefined,
    contentClass = undefined,
    closeOnClick = true,
    open = $bindable(false),
    triggerWrapper,
    triggerContent,
    dropdown
  }: Props = $props();

    let showModal = $state(false);
    let width: number | undefined = $state();

    let dropdownWrapper: HTMLDivElement | undefined = $state();
    let dropdownContentWrapper: HTMLDivElement | undefined = $state();

    $effect(() => {
        if (browser && width !== undefined) {
            // breakpoint: sm
            showModal = open && width < 640;
        }
    });

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

    let openUpwards = $state(false); // track dropdown direction
    function checkDropdownPosition() {
        if (!dropdownWrapper || !dropdownContentWrapper || showModal) return;

        const triggerRect = dropdownWrapper.getBoundingClientRect();
        const dropdownHeight = dropdownContentWrapper.scrollHeight + 75;

        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        openUpwards =
            spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
    }

    const toggleOpen = () => {
        // trigger_ref.focus();
        // console.log("open");

        open = !open;
        if (open) {
            checkDropdownPosition();
        }
    };

    const click_outside = () => {
        // console.log("clicked outside");
        // open = false;

        if (!showModal) {
            open = false;
        }
    };
</script>

<div
    class={twMerge("dropdown", className)}
    use:clickOutside
    onclick_outside={click_outside}
    bind:this={dropdownWrapper}>
    {#if triggerWrapper}
        {@render triggerWrapper()}
    {:else}
        <button
            class={twMerge("dropdown-btn flex focus:ring-2", buttonClass)}
            onclick={toggleOpen}
            type="button">
            {@render triggerContent?.()}
        </button>
    {/if}

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
        onclick={(e) => {
            // e.preventDefault();
            if (closeOnClick) {
                click_outside();
            }
        }}
        onkeydown={bubble('keydown')}
        role="button"
        tabindex="0"
        bind:this={dropdownContentWrapper}>
        {@render dropdown?.()}
    </div>
</div>

<Modal
    bind:showModal
    showDividers={false}
    divClassName="!p-0"
    on:closed={() => (open = false)}>
    <div
        onkeydown={bubble('keydown')}
        role="button"
        tabindex="-1"
        onclick={(e) => {
            //e.preventDefault();
            if (closeOnClick) {
                open = false;
            }
        }}>
        {@render dropdown?.()}
    </div>
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

    :global(.dark) .dropdown-content {
        background-color: #374151;
        border-color: #475569;
    }

    /* .dropdown:hover .dropdown-content {
    visibility: visible;
    transform: translateY(0);

    display: block;
  } */
</style>
