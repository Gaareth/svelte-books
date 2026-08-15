<script lang="ts">
    import clsx from "clsx";
    import toast from "svelte-french-toast";

    import { browser } from "$app/environment";
    import Dropdown from "$components/input/Dropdown.svelte";
    import { theme } from "$lib/stores/stores";
    import { isDarkModeEnabled } from "$utils/utils";
    import DarkModeIcon from "../icons/DarkModeIcon.svelte";
    import LightModeIcon from "../icons/LightModeIcon.svelte";
    import DesktopIcon from "../icons/DesktopIcon.svelte";

    const icons = ["🌚", "🌙", "🌑", "🌕", "🌒", "🌖", "✨", "💫", "🌟"];

    export const applyDarkMode = () => {
        theme.set("dark");
        localStorage.setItem("theme", $theme);

        apply();
    };

    const applySystem = () => {
        theme.set("system");
        localStorage.setItem("theme", $theme);

        apply();
    };

    const applyLightMode = () => {
        theme.set("light");
        localStorage.setItem("theme", $theme);

        apply();
    };

    const apply = (notify = true) => {
        if (isDarkModeEnabled($theme, window)) {
            document.documentElement.classList.add("dark");
            if (notify) {
                toast("Hello Darkness!", {
                    icon: icons[Math.floor(Math.random() * icons.length)],
                    style: "background: rgb(51 65 85); color: #fff;",
                    position: "bottom-right",
                });
            }
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const toggleMode = () => {
        if ($theme == "dark") {
            theme.set("light");
        } else if ($theme == "light") {
            theme.set("dark");
        } else {
            throw new Error("cant toggle system theme");
        }

        localStorage.setItem("theme", $theme);

        apply();
    };

    let prefersDark: boolean | undefined = $state();
    if (browser) {
        if ("theme" in localStorage) {
            theme.set(localStorage.theme);
        }

        prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        apply(false);
    }

    const theme_dropdown_button_class = `
        w-full flex items-center gap-3 p-4 sm:p-2
        hover:bg-gray-200 dark:hover:bg-slate-600 dark:sm:hover:bg-gray-600
        dark:hover:text-white rounded-md
    `;
</script>

<Dropdown buttonClass="outline-none">
    {#snippet triggerContent()}
        <span
            title="Change theme"
            aria-label="open theme changer dropdown"
            class="dark:text-purple-500 text-yellow-400 inline-block
        hover:scale-[1.15] transition-transform ease-out">
            {#if $theme == "dark"}
                <DarkModeIcon class="w-9 h-9" />
            {:else if $theme == "light"}
                <LightModeIcon class="w-9 h-9" />
            {:else}
                <DesktopIcon class="w-9 h-9" />
            {/if}
        </span>
    {/snippet}
    {#snippet dropdown()}
        <ul
            class="flex flex-col gap-1 p-4 sm:px-1 sm:py-1 w-56 sm:w-36 text-sm text-gray-700 dark:text-gray-200">
            <li>
                <button
                    onclick={applyDarkMode}
                    class={clsx(
                        `hover:!text-purple-400 dark:!text-purple-400`,
                        theme_dropdown_button_class,
                    )}>
                    <DarkModeIcon class="w-5 h-5" />
                    Dark
                </button>
            </li>
            <li>
                <button
                    onclick={applyLightMode}
                    class={clsx(
                        `text-yellow-500 dark:text-inherit hover:!text-yellow-500 dark:hover:!text-yellow-200`,
                        theme_dropdown_button_class,
                    )}>
                    <LightModeIcon class="w-5 h-5" />

                    Light
                </button>
            </li>
            <li>
                <button
                    onclick={applySystem}
                    class={clsx(
                        theme_dropdown_button_class,
                        prefersDark
                            ? "hover:!text-purple-400"
                            : "hover:!text-yellow-500 dark:hover:!text-yellow-200",
                    )}>
                    <DesktopIcon class="w-5 h-5" />
                    System
                </button>
            </li>
        </ul>
    {/snippet}
</Dropdown>

<style lang="postcss">
    /* .theme-dropdown-button {
        @apply w-full flex items-center gap-3 p-4 sm:p-2;
        @apply hover:bg-gray-200;
        @apply dark:hover:bg-slate-600;
        @apply dark:sm:hover:bg-gray-600;
        @apply dark:hover:text-white;
        @apply rounded-md;
    } */
</style>
