<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { Toaster } from "svelte-french-toast";
  import ThemeSwitcher from "$lib/ThemeSwitcher.svelte";
  const version = VERSION;
</script>

<header aria-label="Site Header" class="shadow-sm">
  <div class="mx-auto max-w-screen-xl p-4">
    <div
      class="flex items-center justify-between gap-4 lg:gap-10 min-[500px]:flex-row flex-col"
    >
      <div class="flex lg:w-0 lg:flex-1" />

      <nav aria-label="Site Nav" class="gap-8 text-md font-medium flex">
        <a class="text-gray-500 hover:text-[#F2440D]" href="/">Home</a>
        <a class="text-gray-500" href="/to-read">To-Read</a>
      </nav>

      <div class="flex-1 justify-end flex">
        <div class="flex gap-4 items-center">
          {#if $page.data.session}
            <span class="signedInText">
              <small>Signed in as</small><br />
              <strong>{$page.data.session.user?.name}</strong>
            </span>
            <div>
              <a
                href="/auth/signout"
                class="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-500 border 
            border-gray-100 hover:border-gray-200
            dark:bg-slate-700 dark:text-white dark:border-slate-700 dark:hover:border-slate-600"
                data-sveltekit-preload-data="off">Sign out</a
              >
            </div>
          {:else}
            <div>
              <a
                class="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-500 border
            border-gray-100 hover:border-gray-200 
            dark:bg-slate-700 dark:text-white dark:border-slate-700 dark:hover:border-slate-600"
                href="/auth/signin"
              >
                Log in
              </a>
            </div>
          {/if}
        </div>
        <div class="flex items-center sm:ml-10 ml-2">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  </div>
</header>

<main class="pb-20 px-2 md:px-0">
  <Toaster />

  <div class="container max-w-3xl mx-auto">
    <slot />
  </div>
</main>

<footer class="bg-[#F2440D] min-h-10 absolute bottom-[-100px] w-full">
  <div class="text-white mx-auto max-w-3xl flex p-2 flex-col text-center gap-2">
    <span class="text-gray-200 text-md text-center absolute">
        V{version}
    </span>
    <p>
      Made using
      <a href="https://svelte.dev/" class="underline font-semibold">Svelte</a> /
      - Kit and <a href="/tech-stack">...</a>
    </p>
    <p>
      by <a href="https://github.com/Gaareth" class="underline">Gareth</a>
    </p>
  </div>
</footer>

<style lang="postcss">
  :global(html) {
    @apply motion-reduce:transition-none motion-reduce:hover:transform-none;
  }

</style>
