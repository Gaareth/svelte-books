<script lang="ts">
    import "../app.css";
    import clsx from "clsx";
    import { Toaster } from "svelte-french-toast";
    import { twMerge } from "tailwind-merge";

    import { page } from "$app/state";
    import Dropdown from "$components/input/Dropdown.svelte";
    import ThemeSwitcher from "$components/ThemeSwitcher.svelte";
    import { READING_ACTIVITY_TYPES } from "$lib/constants/enums";
    import IconAccount from "$lib/icons/IconAccount.svelte";

    import { resolve } from "$app/paths";

    const version = APP_VERSION;
    let { data, children } = $props();

    let headerConfig = $derived(page.data.headerConfig || {});
</script>

<svelte:head>
    <title>{page.data.title || "BookList"}</title>
</svelte:head>

<header
    aria-label="Site Header"
    class={clsx(
        !headerConfig.transparent &&
            "shadow-sm bg-white/10 dark:bg-slate-600/40 backdrop-blur-md",
    )}>
    {#if import.meta.env.DEV}
        <div
            class="w-full bg-red-500 h-[30px] text-center text-xl flex items-center justify-center">
            DEV MODE
        </div>
    {/if}

    <div class="mx-auto max-w-screen-xl p-4">
        <div
            class="flex flex-wrap items-center justify-between gap-4 lg:gap-10 min-[500px]:flex-row flex-col">
            <div class="flex lg:w-0 lg:flex-1"></div>

            <nav
                aria-label="Site Nav"
                class="gap-8 text-md font-medium flex flex-wrap">
                <a
                    class="text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                    href={resolve("/")}>
                    Home
                </a>
                {#if page.data.session}
                    <a
                        class="nav-a"
                        href="/lists/{READING_ACTIVITY_TYPES.TO_READ}">
                        To-Read
                    </a>
                    {#if data.isAdmin}
                        <a class="nav-a" href={resolve("/admin")}>Admin</a>
                    {/if}
                {/if}
                <a class="nav-a" href={resolve("/about")}>About</a>
            </nav>

            <div class="flex-1 justify-end flex">
                <div class="flex flex-row-reverse xl:flex-row">
                    <div class="flex gap-4 items-center">
                        {#if page.data.session}
                            <Dropdown contentClass="!py-0" closeOnClick={false}>
                                {#snippet triggerContent()}
                                    <span
                                        aria-label="open account dropdown"
                                        title="Account"
                                        class="block w-8 text-secondary hover:text-secondary-hover">
                                        <IconAccount />
                                    </span>
                                {/snippet}

                                {#snippet dropdown()}
                                    <div
                                        class="w-56 sm:w-36"
                                        id="dropdown-account">
                                        <div class="">
                                            {#if data.isAdmin}
                                                <div
                                                    class="bg-red-500 w-full h-6 text-center text-sm rounded-t">
                                                    ADMIN
                                                </div>
                                            {/if}
                                            <div>
                                                <a
                                                    href={resolve("/[[username]]", {
                                                        username:
                                                            page.data.session
                                                                ?.user?.name!,
                                                    })}
                                                    class="text-center font-bold py-1">
                                                    {page.data.session?.user
                                                        ?.name}
                                                </a>
                                            </div>
                                            <hr />
                                            <div
                                                class="py-2 flex flex-col gap-1 text-secondary-2">
                                                <a href={resolve("/settings")}>
                                                    Settings
                                                </a>
                                                <a href={resolve("/users")}>
                                                    All Users
                                                </a>
                                            </div>
                                            <hr />
                                            <div class="py-2">
                                                <a
                                                    href={resolve("/logout")}
                                                    class="whitespace-nowrap"
                                                    data-sveltekit-preload-data="off">
                                                    Sign Out
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                {/snippet}
                            </Dropdown>
                        {:else}
                            <div>
                                <a class="auth-button" href={resolve("/login")}>
                                    Log in
                                </a>
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
        class={twMerge(
            "container max-w-3xl mx-auto",
            headerConfig.wrapperClass,
        )}>
        {@render children?.()}
    </div>
</main>

<footer class="bg-indigo-400 min-h-10 absolute bottom-[-100px] w-full">
    <div
        class="text-stone-900 mx-auto max-w-3xl flex flex-col text-center gap-1 p-2">
        <p class="text-md text-left sm:text-center sm:absolute w-full sm:w-fit">
            V{version}
        </p>
        <p class="opacity-90">
            Made using
            <a href="https://svelte.dev/" class="underline font-semibold">
                Svelte
            </a>
            / - Kit and
            <a href={resolve("/tech-stack")} class="hover:underline">more</a>
        </p>
    </div>
    <p class="absolute top-0 right-0 p-2 text-violet-900">
        <a
            href="https://github.com/Gaareth/svelte-books"
            class="hover:underline">
            by Gareth
        </a>
    </p>
</footer>

<style lang="postcss">
    :global(html) {
        @apply motion-reduce:transition-none motion-reduce:hover:transform-none;
    }

    .auth-button {
        @apply bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 whitespace-nowrap
            border border-gray-100 hover:border-gray-200 rounded-lg;
    }

    :global(.dark) .auth-button {
        @apply bg-slate-700 text-white border-slate-700 hover:border-slate-600;
    }

    .nav-a {
        @apply text-gray-500 hover:text-gray-600;
    }

    :global(.dark) .nav-a {
        @apply text-gray-400;
    }

    :global(.dark) .nav-a:hover {
        @apply text-gray-300;
    }

    #dropdown-account a {
        @apply px-4 block hover:bg-gray-200;
    }

    #dropdown-account hr {
        @apply border-gray-300;
    }

    :global(.dark) #dropdown-account a {
        @apply hover:bg-slate-500;
    }

    :global(.dark) #dropdown-account hr {
        @apply border-slate-400;
    }
</style>
