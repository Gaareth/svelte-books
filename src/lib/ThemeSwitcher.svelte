<script lang="ts">
  import { browser } from "$app/environment";
  import IoIosMoon from "svelte-icons/io/IoIosMoon.svelte";
  import IoIosSunny from "svelte-icons/io/IoIosSunny.svelte";

  let darkMode: boolean = false;

  const toggleMode = () => {
    darkMode = !darkMode;

    localStorage.setItem("theme", darkMode ? "dark" : "light");

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (browser) {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      darkMode = true;
    } else {
      document.documentElement.classList.remove("dark");
      darkMode = false;
    }
  }
</script>

<button title="Toggle" on:click={toggleMode} class="hover:scale-[1.15] transition-transform ease-out">
  <div class="w-10 h-10 text-purple-500 dark:text-yellow-300">
    {#if darkMode}
      <IoIosSunny />
    {:else}
      <IoIosMoon />
    {/if}
  </div>
</button>
