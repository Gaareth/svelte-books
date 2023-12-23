<script lang="ts">
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";
  import type { ActionData } from "../$types.js";

  import type { Book } from "@prisma/client";
  import { toast } from "svelte-french-toast";
  import { enhance } from "$app/forms";
  import ReloadButton from "./ReloadButton.svelte";

  export let form: settingsApiResult | settingsApiReloadResult;
  console.log("form: ", form);

  import type { SSE_EVENT } from "../book/api/update_all/sse.js";
  import type {
    settingsApiReloadResult,
    settingsApiResult,
  } from "./+page.server.js";
  import AddApiButton from "./AddApiButton.svelte";

  let evtSource: EventSource;

  let currentStatus: typeof SSE_EVENT | undefined = undefined;

  let loading = false;

  //TODO: toast
</script>

<h1 class="text-5xl my-4">Settings</h1>

<section>
  <h2 class="text-2xl">Datasource</h2>
  <div class="flex flex-col gap-6 sm:gap-2">
    <ReloadButton {form} />
    <AddApiButton {form} />
  </div>
</section>
