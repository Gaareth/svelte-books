<script>
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
</script>

<div class="item-border p-2 my-2 flex items-center">
  <div class="flex items-center animate-pulse gap-4">
    <div class="w-10 h-12 bg-slate-200 dark:bg-slate-500 rounded" />
    <div class="flex flex-col gap-2">
      <div class="bg-slate-200 dark:bg-slate-500 rounded w-20 h-3" />
      <div class="bg-slate-200 dark:bg-slate-500 rounded w-10 h-3" />
    </div>
  </div>
  <div class="flex flex-row items-center gap-2 flex-grow justify-center">
    <span class="animate-pulse">loading</span>
    <div class="loading-wrapper">
      <p />
      <LoadingSpinner />
    </div>
  </div>
</div>
