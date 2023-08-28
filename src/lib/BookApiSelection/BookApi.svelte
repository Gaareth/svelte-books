<script lang="ts">
  import type { queriedBookFull } from "../../routes/book/api/api.server";
  import BookApiConfirm from "./BookApiConfirm.svelte";
  import BookApiSelection from "./BookApiSelection.svelte";

  export let volumeId: string;
  let apiBookSelected: boolean;
  export let apiData: Promise<queriedBookFull> | undefined = undefined;
</script>

<details open>
  <summary>Add API data?</summary>
  <div>
    <div hidden={!apiBookSelected || volumeId === undefined}>
        <BookApiConfirm {volumeId} bind:apiBookSelected bind:getBookPromise={apiData} />
    </div>

    <div hidden={apiBookSelected}>
      <BookApiSelection
        class="my-2"
        bind:selectedBookId={volumeId}
        bind:apiBookSelected
      />
    </div>
  </div>
</details>
