<script lang="ts">
  import "../app.css";
  import { initFlash } from "sveltekit-flash-message/client";
  import { page } from "$app/stores";

  const flash = initFlash(page);
  const flashTimeoutMs = 5000;

  let flashTimeout: ReturnType<typeof setTimeout>;
  $: if ($flash) {
    clearTimeout(flashTimeout);
    flashTimeout = setTimeout(() => ($flash = undefined), flashTimeoutMs);
  }
</script>

<nav class="mx-auto flex justify-center gap-10">
  <a href="/" class="text-blue-700">Home</a>
  <a href="/about" class="text-blue-700">About</a>
  <a href="/settings" class="text-blue-700">Settings</a>
</nav>

<div class="signedInStatus">
  <p class="nojs-show loaded">
    {#if $page.data.session}
      {#if $page.data.session.user?.image}
        <span
          style="background-image: url('{$page.data.session.user.image}')"
          class="avatar"
        />
      {/if}
      <span class="signedInText">
        <small>Signed in as</small><br />
        <strong
          >{$page.data.session.user?.email ??
            $page.data.session.user?.name}</strong
        >
      </span>
      <a href="/auth/signout" class="button" data-sveltekit-preload-data="off"
        >Sign out</a
      >
    {:else}
      <span class="notSignedInText">You are not signed in</span>
      <a
        href="/auth/signin"
        class="buttonPrimary"
        data-sveltekit-preload-data="off">Sign in</a
      >
    {/if}
  </p>
</div>

<main>
  <div class="container max-w-2xl mx-auto">
    {#if $flash}
      {@const bg = $flash.type == "success" ? "#3D9970" : "#FF4136"}
      <div style:background-color={bg} class="flash my-2 p-1 rounded">
        {$flash.message}
      </div>
    {/if}

    <slot />
  </div>
</main>
