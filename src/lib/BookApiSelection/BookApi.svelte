<script lang="ts">
  import type { queriedBookFull } from "$appTypes";
  import type { EventDispatcher } from "svelte";
  // import { createEventDispatcher, type EventDispatcher } from "svelte";
  import BookApiConfirm from "./BookApiConfirm.svelte";
  import BookApiSelection from "./BookApiSelection.svelte";

  export let volumeId: string | undefined;
  export let dispatch: EventDispatcher<any>;
  export let query: string | undefined = undefined;

  let apiBookSelected: boolean = false;

  let getBookPromise: Promise<queriedBookFull> | undefined = undefined;

  $: {
    if (volumeId !== undefined && apiBookSelected) {
      getBookPromise = getBook(volumeId);
    }
  }

  async function getBook(id: string) {
    console.log("FETRHCINGF");

    return (await fetch(`/book/api/get/${id}`)).json();
  }
</script>

<div hidden={!apiBookSelected || volumeId === undefined}>
  <BookApiConfirm {volumeId} bind:apiBookSelected {getBookPromise} {dispatch} />
</div>

<div hidden={apiBookSelected}>
  <BookApiSelection
    class="my-2"
    bind:selectedBookId={volumeId}
    bind:apiBookSelected
    bind:query
    {dispatch}
  />
</div>
