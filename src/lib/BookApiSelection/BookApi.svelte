<script lang="ts">
  import type { queriedBookFull } from "$appTypes";
  import { createEventDispatcher, type EventDispatcher } from "svelte";
  import BookApiConfirm from "./BookApiConfirm.svelte";
  import BookApiSelection from "./BookApiSelection.svelte";

  export let volumeId: string | undefined;
  let apiBookSelected: boolean = false;
  export let apiData: Promise<queriedBookFull> | undefined = undefined;
  export let open = true;
  export let summary_text = "Add API data?";

  const dispatch = createEventDispatcher();
</script>

<details {open}>
  <summary>{summary_text}</summary>
  <div>
    <div hidden={!apiBookSelected || volumeId === undefined}>
        <BookApiConfirm {volumeId} bind:apiBookSelected bind:getBookPromise={apiData} {dispatch}/>
    </div>

    <div hidden={apiBookSelected}>
      <BookApiSelection
        class="my-2"
        bind:selectedBookId={volumeId}
        bind:apiBookSelected
        {dispatch}
      />
    </div>
  </div>
</details>
