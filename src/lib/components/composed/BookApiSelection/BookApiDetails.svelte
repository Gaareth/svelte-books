<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import BookApi from "./BookApi.svelte";

  import type { queriedBookFull } from "$appTypes";

  export let volumeId: string | undefined;
  export let getBookPromise: Promise<queriedBookFull> | undefined = undefined;

  export let open = true;
  export let summary_text = "Add API data?";
  export let query: string | undefined = undefined;

  const dispatch = createEventDispatcher();
</script>

<details {open}>
  <summary class="text-lg">{summary_text}</summary>
  <div>
    <BookApi
      bind:getBookPromise
      bind:volumeId
      bind:query
      {dispatch}
      label="Add API data" />
  </div>
</details>
