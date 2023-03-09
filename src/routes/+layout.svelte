<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { Toaster } from "svelte-french-toast";

</script>

<header aria-label="Site Header" class="shadow-sm">
  <div class="mx-auto max-w-screen-xl p-4">
    <div class="flex items-center justify-between gap-4 lg:gap-10 min-[400px]:flex-row flex-col">
      <div class="flex lg:w-0 lg:flex-1" />

      <nav
        aria-label="Site Nav"
        class="gap-8 text-md font-medium flex"
      >
        <a class="text-gray-500 hover:text-[#F2440D]" href="/">Home</a>
        <a class="text-gray-500" href="/to-read">To-Read</a>
      </nav>

      <div class="flex-1 items-center justify-end gap-4 flex">
        {#if $page.data.session}
          <span class="signedInText">
            <small>Signed in as</small><br />
            <strong>{$page.data.session.user?.name}</strong>
          </span>
          <a
            href="/auth/signout"
            class="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-500 border 
            border-gray-100 hover:border-gray-200"
            data-sveltekit-preload-data="off">Sign out</a
          >
        {:else}
          <a
            class="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-500 border
            border-gray-100 hover:border-gray-200"
            href="/auth/signin"
          >
            Log in
          </a>
        {/if}
      </div>


    </div>
  </div>
</header>

<main class="pb-20">
  <Toaster />

  <div class="container max-w-2xl mx-auto">
    <slot/>
  </div>
</main>

<footer class="bg-[#F2440D] min-h-10 absolute bottom-0 w-screen">
  <div class="text-white mx-auto max-w-2xl flex p-2 flex-col text-center gap-2">
     <p> 
      Made using 
      <a href="https://svelte.dev/" class="underline font-semibold">Svelte</a> / - Kit
      and <a href="/tech-stack">...</a>
    </p>
     <p>
      by <a href="https://github.com/Gaareth" class="underline">Gareth</a>
     </p>
  </div>
</footer>

<style lang="postcss">
  /* :global(.btn) {
    @apply text-lg
  } */

  :global(.btn-primary-black) {
    @apply inline-flex items-center gap-2 rounded-md border-2 border-[#171515] bg-[#171515] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-transparent hover:text-[#171515] focus:outline-none focus:ring active:opacity-75;
  }

  :global(.btn-primary-black:disabled) {
    @apply inline-flex items-center gap-2 rounded-md border-2 border-[#545250] bg-[#545250] px-3 py-2 text-sm font-medium text-white focus:outline-none focus:ring active:opacity-75;
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
