<script lang="ts">
    import { resolve } from "$app/paths";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>

<div class="center-screen p-3 sm:p-6">
    <div>
        <h1 class="text-5xl text-center mb-5">Login</h1>
        <div class="relative flex flex-1 flex-col items-center justify-center">
            <form
                method="post"
                action="/auth/callback/credentials"
                class="w-full max-w-sm">
                <input type="hidden" name="callbackUrl" value="/" />

                <p class="mb-5 text-secondary">
                    Login to access your book collection, and view the books
                    shared only with authenticated users
                </p>

                <p
                    class="{data.error
                        ? 'block'
                        : 'hidden'} text-error text-center font-bold text-xl my-4">
                    Username or password are not correct
                </p>
                <div>
                    <label for="username">Username</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        class="input w-full {data.error ? 'input-error' : ''}"
                        autocomplete="username" />
                </div>
                <div class="mt-4">
                    <label for="password">Password</label>
                    <input
                        autocomplete="current-password"
                        type="password"
                        name="password"
                        id="password"
                        class="input w-full {data.error
                            ? 'input-error'
                            : ''}" />
                </div>

                <button
                    class="mt-8 w-full px-4 py-2 border border-blue-700 bg-blue-700 rounded-md
      font-bold uppercase text-white
      hover:bg-transparent hover:text-black
      dark:hover:bg-blue-600 dark:hover:text-white
      transition-colors"
                    type="submit">
                    login
                </button>
                <p class="text-lg text-secondary mt-4">
                    Don't have an account yet? <a
                        href={resolve("/register/")}
                        class="dark:text-blue-400 text-blue-500 underline text-lg">
                        Sign up here
                    </a>
                </p>
            </form>
        </div>
    </div>
</div>
