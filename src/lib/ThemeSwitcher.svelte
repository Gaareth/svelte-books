<script lang="ts">
  import { browser } from "$app/environment";
  import toast from "svelte-french-toast";
  import IoIosMoon from "svelte-icons/io/IoIosMoon.svelte";
  import IoIosSunny from "svelte-icons/io/IoIosSunny.svelte";
  import { darkMode } from "./stores/stores";

  const icons = ["🌚", "🌙", "🌑", "🌕", "🌒", "🌖", "✨", "💫", "🌟"];

  const toggleMode = () => {
    // darkMode = !darkMode;
    darkMode.set(!$darkMode);

    localStorage.setItem("theme", $darkMode ? "dark" : "light");

    if ($darkMode) {
      document.documentElement.classList.add("dark");
      toast("Hello Darkness!", {
        icon: icons[Math.floor(Math.random() * icons.length)],
        style: "background: rgb(51 65 85); color: #fff;",
        position: "bottom-right",
      });
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
      // darkMode = true;
      darkMode.set(true);
    } else {
      document.documentElement.classList.remove("dark");
      // darkMode = false;
      darkMode.set(false);
    }
  }
</script>

<button
  title="Toggle"
  on:click={toggleMode}
  class="hover:scale-[1.15] transition-transform ease-out"
>
  <div class="w-10 h-10 text-purple-500 dark:text-yellow-300">
    {#if $darkMode}
      <IoIosSunny />
    {:else}
      <IoIosMoon />
    {/if}
  </div>
</button>
