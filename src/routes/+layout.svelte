<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { Toaster } from "svelte-french-toast";
  import ThemeSwitcher from "$lib/ThemeSwitcher.svelte";
  // eslint-disable-next-line no-undef
  const version = APP_VERSION;
  export let data;
</script>

<svelte:head>
  <title>{$page.data.title || "Books - Gareth"}</title>
</svelte:head>

<header aria-label="Site Header" class="shadow-sm bg-white dark:bg-slate-800">
  <div class="mx-auto max-w-screen-xl p-4">
    <div
      class="flex items-center justify-between gap-4 lg:gap-10 min-[500px]:flex-row flex-col"
    >
      <div class="flex lg:w-0 lg:flex-1" />

      <nav aria-label="Site Nav" class="gap-8 text-md font-medium flex">
        <a
          class="text-gray-500 dark:text-gray-400
        hover:text-[#F2440D] dark:hover:text-[#f67c56]"
          href="/"
        >
          Home
        </a>
        {#if $page.data.session}
          <a class="nav-a" href="/to-read">To-Read</a>
          <a class="nav-a" href="/settings">Settings</a>
          {#if data.isAdmin}
            <a class="nav-a" href="/admin">Admin</a>
          {/if}
        {/if}
        <a class="nav-a" href="/about">About</a>
      </nav>

      <div class="flex-1 justify-end flex">
        <div class="flex flex-row-reverse xl:flex-row">
          <div class="flex gap-4 items-center">
            {#if $page.data.session}
              <span class="signedInText">
                <small>Signed in as</small><br />
                <strong>{$page.data.session.user?.name}</strong>
              </span>
              <div>
                <a
                  href="/auth/signout"
                  class="auth-button"
                  data-sveltekit-preload-data="off">Sign out</a
                >
              </div>
            {:else}
              <div>
                <a class="auth-button" href="/auth/signin"> Log in </a>
              </div>
            {/if}
          </div>
          <div class="flex items-center sm:ml-10 ml-2 xl:mr-0 mr-10">
            <ThemeSwitcher />
          </div>
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

<footer class="bg-[#da3d0c] min-h-10 absolute bottom-[-100px] w-full">
  <div class="text-white mx-auto max-w-3xl flex flex-col text-center gap-1 p-2">
    <p class="text-md text-left sm:text-center sm:absolute w-full sm:w-fit">
      V{version}
    </p>
    <p>
      Made using
      <a href="https://svelte.dev/" class="underline font-semibold">Svelte</a> /
      - Kit and <a href="/tech-stack">more</a>
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

  .auth-button {
    @apply bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 whitespace-nowrap
            border border-gray-100 hover:border-gray-200 rounded-lg
            dark:bg-slate-700 dark:text-white dark:border-slate-700 dark:hover:border-slate-600;
  }

  .nav-a {
    @apply text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300;
  }
</style>
