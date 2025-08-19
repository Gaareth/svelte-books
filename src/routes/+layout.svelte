<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
  import { Toaster } from "svelte-french-toast";
  import ThemeSwitcher from "$lib/ThemeSwitcher.svelte";
  import Dropdown from "$lib/Dropdown.svelte";
  import IconAccount from "$lib/icons/IconAccount.svelte";
  import clsx from "clsx";
  import { twMerge } from "tailwind-merge";
  // eslint-disable-next-line no-undef
  const version = APP_VERSION;
  export let data;

  $: headerConfig = $page.data.headerConfig || {};
</script>

<svelte:head>
  <title>{$page.data.title || "Books - Gareth"}</title>
</svelte:head>

<header
  aria-label="Site Header"
  class={clsx(
    !headerConfig.transparent &&
      "shadow-sm bg-white/10 dark:bg-slate-600/40 backdrop-blur-md"
  )}>
  <div class="mx-auto max-w-screen-xl p-4">
    <div
      class="flex flex-wrap items-center justify-between gap-4 lg:gap-10 min-[500px]:flex-row flex-col">
      <div class="flex lg:w-0 lg:flex-1" />

      <nav
        aria-label="Site Nav"
        class="gap-8 text-md font-medium flex flex-wrap">
        <a
          class="text-gray-500 dark:text-gray-400
        hover:text-[#F2440D] dark:hover:text-[#f67c56]"
          href="/">
          Home
        </a>
        {#if $page.data.session}
          <a class="nav-a" href="/To-read">To-Read</a>
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
              <Dropdown contentClass="!py-0" closeOnClick={false}>
                <span
                  slot="triggerContent"
                  aria-label="open account dropdown"
                  title="Account"
                  class="block w-8 text-secondary hover:text-secondary-hover">
                  <IconAccount />
                </span>

                <div slot="dropdown" class="w-56 sm:w-36" id="dropdown-account">
                  <div class="">
                    <div class="p-1">
                      <p class="text-center font-bold">
                        {$page.data.session.user?.name}
                      </p>
                    </div>
                    <hr />
                    <div class="py-2 flex flex-col gap-1 text-secondary-2">
                      <a href="/settings">Settings</a>
                      <a href="/users">all users</a>
                    </div>
                    <hr />
                    <div class="py-2">
                      <a
                        href="/auth/signout"
                        class="whitespace-nowrap"
                        data-sveltekit-preload-data="off">
                        Sign out
                      </a>
                    </div>
                  </div>
                </div>
              </Dropdown>
            {:else}
              <div>
                <a class="auth-button" href="/auth/signin">Log in</a>
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

<main class="pb-20 px-2">
  <Toaster />

  <div
    class={twMerge("container max-w-3xl mx-auto", headerConfig.wrapperClass)}>
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
      <a href="https://svelte.dev/" class="underline font-semibold">Svelte</a>
      / - Kit and
      <a href="/tech-stack">more</a>
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

  #dropdown-account a {
    @apply px-4 block dark:hover:bg-slate-500 hover:bg-gray-200;
  }

  #dropdown-account hr {
    @apply dark:border-slate-400 border-gray-300;
  }
</style>
