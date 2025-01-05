<script lang="ts">
  import type { PageData } from "./$types";

  export let data: PageData;
  let csrfToken = data.csrfToken;
  let error = data.error;
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<div class="center-screen p-3 sm:p-6">
  <div>
    <h1 class="text-5xl text-center mb-10">Login</h1>
    <div class="relative flex flex-1 flex-col items-center justify-center">
      <form
        method="post"
        action="/auth/callback/credentials"
        class="w-full max-w-sm"
      >
        <p
          class="{error
            ? 'block'
            : 'hidden'} text-error text-center font-bold text-xl my-4"
        >
          Username or password are not correct
        </p>
        <input name="csrfToken" type="hidden" value={csrfToken} />
        <div>
          <label for="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            class="input w-full {error ? 'input-error' : ''}"
            autocomplete="username"
          />
        </div>
        <div class="mt-4">
          <label for="password">Password</label>
          <input
            autocomplete="current-password"
            type="password"
            name="password"
            id="password"
            class="input w-full {!error || 'input-error'}"
          />
        </div>

        <button
          class="mt-8 w-full px-4 py-2 border border-blue-700 bg-blue-700 rounded-md
      font-bold uppercase text-white
      hover:bg-transparent hover:text-black
      dark:hover:bg-blue-600 dark:hover:text-white
      transition-colors"
          type="submit"
        >
          login
        </button>
        <p class="text-lg text-secondary mt-4">
          Don't have an account yet? <a
            href="/register/"
            class="dark:text-blue-400 text-blue-500 underline text-lg"
            >Sign up here</a
          >
        </p>
      </form>
    </div>
  </div>
</div>
