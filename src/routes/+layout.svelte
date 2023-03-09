<script lang="ts">
  import "../app.css";
  import { initFlash } from "sveltekit-flash-message/client";
  import { page } from "$app/stores";
  import { SvelteToast } from "@zerodevx/svelte-toast";

  const flash = initFlash(page);
  const flashTimeoutMs = 5000;

  let flashTimeout: ReturnType<typeof setTimeout>;
  $: if ($flash) {
    clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => ($flash = undefined), flashTimeoutMs);
  }
</script>

<header aria-label="Site Header" class="shadow-sm">
  <div class="mx-auto max-w-screen-xl p-4">
    <div class="flex items-center justify-between gap-4 lg:gap-10">
      <div class="flex lg:w-0 lg:flex-1" />

      <nav
        aria-label="Site Nav"
        class="hidden gap-8 text-md font-medium md:flex"
      >
        <a class="text-gray-500" href="/">Home</a>
        <a class="text-gray-500" href="/to-read">To-Read</a>
      </nav>

      <div class="hidden flex-1 items-center justify-end gap-4 sm:flex">
        {#if $page.data.session}
          <span class="signedInText">
            <small>Signed in as</small><br />
            <strong>{$page.data.session.user?.name}</strong>
          </span>
          <a
            href="/auth/signout"
            class="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-500"
            data-sveltekit-preload-data="off">Sign out</a
          >
        {:else}
          <a
            class="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-500"
            href="/auth/signin"
          >
            Log in
          </a>
        {/if}
      </div>

      <div class="lg:hidden">
        <button class="rounded-lg bg-gray-100 p-2 text-gray-600" type="button">
          <span class="sr-only">Open menu</span>
          <svg
            aria-hidden="true"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewbox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</header>

<main>
  <SvelteToast />

  <div class="container max-w-2xl mx-auto">
    {#if $flash}
      {@const color =
        $flash.type == "success" ? "text-green-600" : "text-red-600"}
      <div
        role="alert"
        class="rounded-xl border border-gray-100 p-4 shadow-xl mt-5 mb-12"
      >
        <div class="flex items-start gap-4">
          <span class={color}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>

          <div class="flex-1">
            <strong class="block font-medium text-gray-900">
              {$flash.type}
            </strong>

            <p class="mt-1 text-sm text-gray-700">
              {$flash.message}
            </p>
          </div>

          <button class="text-gray-500 transition hover:text-gray-600">
            <span class="sr-only">Dismiss popup</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    {/if}

    <slot />
  </div>
</main>

<style lang="postcss">
  /* :global(.btn) {
    @apply text-lg
  } */

  :global(.underline-hover) {
    @apply before:bg-black relative font-medium before:absolute before:-bottom-1 before:h-0.5 before:w-full before:scale-x-0  before:transition hover:before:scale-x-100;
  }

  :global(.btn-primary-black) {
    @apply inline-flex items-center gap-2 rounded-md border-2 border-[#171515] bg-[#171515] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-transparent hover:text-[#171515] focus:outline-none focus:ring active:opacity-75;
  }

  :global(.btn-primary-black:disabled) {
    @apply inline-flex items-center gap-2 rounded-md border-2 border-[#545250] bg-[#545250] px-3 py-2 text-sm font-medium text-white focus:outline-none focus:ring active:opacity-75;
  }

  :global(.input) {
    @apply border-gray-200 rounded-md sm:text-sm mt-1 w-full;
  }

  :global(html) {
    @apply motion-reduce:transition-none motion-reduce:hover:transform-none;
  }

  :global(.input-error) {
    border-color: red !important;
  }

  :global(.text-error) {
    color: red !important;
    font-size: 0.8rem;
  }
</style>
