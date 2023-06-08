<script lang="ts">
  export let data;
  let csrfToken = data.csrfToken;  
</script>

<svelte:head>
  <title>Logout</title>
</svelte:head>

<div class="mx-auto h-screen flex items-center justify-center">
  <form class="mb-40" method="POST" action="/auth/signout">
    <input name="csrfToken" type="hidden" value={csrfToken} />

    <button
      class="transition-colors uppercase font-bold 
      hover:bg-transparent dark:hover:bg-blue-600 hover:text-black dark:hover:text-white

        px-10 py-3 bg-blue-700 border border-blue-700 text-white rounded-md"
    >
      logout
    </button>
  </form>
</div>
