<script lang="ts">
  import { browser } from "$app/environment";
  import toast from "svelte-french-toast";
  import IoIosMoon from "svelte-icons/io/IoIosMoon.svelte";
  import IoIosSunny from "svelte-icons/io/IoIosSunny.svelte";
  import IoIosDesktop from "svelte-icons/io/IoIosDesktop.svelte";
  import { theme } from "./stores/stores";
  import Dropdown from "./Dropdown.svelte";

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

  const apply = (notify: boolean = true) => {
    if (
      $theme == "dark" ||
      ($theme == "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
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


  if (browser) {
    if ("theme" in localStorage) {
      theme.set(localStorage.theme);
    }

    apply(false);
  }
</script>

<Dropdown>
  <span slot="button">
    <span
      class="w-10 h-10 dark:text-purple-500 text-yellow-400 inline-block
    hover:scale-[1.15] transition-transform ease-out"
    >
      {#if $theme == "dark"}
        <IoIosMoon />
      {:else if $theme == "light"}
        <IoIosSunny />
      {:else}
        <IoIosDesktop />
      {/if}
    </span>
  </span>
  <ul
    slot="dropdown"
    class="py-1 w-36 text-sm text-gray-700 dark:text-gray-200"
    aria-labelledby="dropdownDefaultButton"
  >
    <li>
      <button
        on:click={applyDarkMode}
        class="theme-dropdown-button"
        >
        <span>
            <IoIosMoon />
        </span>
        Dark
        </button
      >
    </li>
    <li>
      <button
        on:click={applyLightMode}
        class="theme-dropdown-button"
        >
        <span>
            <IoIosSunny />
        </span>
        Light</button
      >
    </li>
    <li>
      <button
        on:click={applySystem}
        class="theme-dropdown-button"
        >
        <span>
            <IoIosDesktop />
        </span>System</button
      >
    </li>
  </ul>
</Dropdown>

<style lang="postcss">
  .theme-dropdown-button {
    @apply w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white;
  }

  .theme-dropdown-button span {
    @apply w-5;
  }
</style>
