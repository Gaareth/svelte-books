<script lang="ts">
  export let data;
  let csrfToken = data.csrfToken;  
  let error = data.error;
</script>

<div
  class="max-w-lg mx-auto my-4"
>
  <h1 class="text-5xl text-center">Login</h1>
  <div
    class="flex gap-3 flex-col rounded-md mt-7 p-4 border dark:border-slate-600 {!error || "input-error"}"
  >
    <form method="post" action="/auth/callback/credentials">
      <p class="{error ? "block" : "hidden"} text-error text-center font-bold text-xl my-3">
          Username or password are not correct
      </p>
      <input name="csrfToken" type="hidden" value={csrfToken} />
      <div>
        <label for="username">Username:</label>
        <input type="text" name="username" id="username" class="input w-full {error ? "input-error" : ""}" />
      </div>
      <div>
        <label for="password">Password:</label>
        <input
          type="password"
          name="password"
          id="password"
          class="input w-full {!error || "input-error"}"
        />
      </div>

      <button
        class="w-full mt-4 px-4 py-2 border border-blue-700 bg-blue-700 rounded-md 
    font-bold uppercase text-white 
    hover:bg-transparent hover:text-black 
    dark:hover:bg-blue-600 dark:hover:text-white
    transition-colors"
        type="submit"
      >
        login
      </button>
    </form>
  </div>
</div>
