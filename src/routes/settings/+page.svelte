<script lang="ts">
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";

  import ReloadButton from "./ReloadButton.svelte";

  import type { SSE_EVENT } from "../book/api/update_all/sse.js";

  import AddApiButton from "./AddApiButton.svelte";
  import ApiResult from "./ApiResult.svelte";

  export let form;

  let currentStatus: typeof SSE_EVENT | undefined = undefined;

  //TODO: toast
</script>

<h1 class="text-5xl my-4">Settings</h1>

<section>
  <h2 class="text-2xl">Datasource</h2>
  <div class="flex flex-col gap-6 sm:gap-8">
    <ReloadButton bind:currentStatus />
    <AddApiButton bind:currentStatus />

    <ApiResult {form} {currentStatus} />
  </div>
</section>
