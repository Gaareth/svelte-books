<script>
    import { resolve } from "$app/paths";
</script>

<svelte:head>
    <title>Logout</title>
</svelte:head>

<div class="center-screen p-3 sm:p-6">
    <div>
        <h1 class="text-5xl text-center mb-5">Logout</h1>
        <div class="relative flex flex-1 flex-col items-center justify-center">
            <form
                method="POST"
                class="w-full max-w-md flex flex-col items-center justify-center">
                <p class="mb-1 text-secondary">
                    You can log out here by clicking the button below. After
                    logging out, you will be redirected to the home page.
                </p>

                <p class="mb-10 text-secondary">
                    If you don't want to log out, you can go back to the <a
                        href={resolve("/")}
                        class="text-blue-500 dark:text-blue-400 underlin hover:text-blue-600 dark:hover:text-blue-500">
                        home page
                    </a>
                </p>

                <button
                    class="transition-colors uppercase font-bold
                hover:bg-transparent dark:hover:bg-blue-600 hover:text-black dark:hover:text-white
                px-10 py-3 bg-blue-700 border border-blue-700 text-white rounded-md">
                    logout
                </button>
            </form>
        </div>
    </div>
</div>
