<script lang="ts">
    import BookApi from "./BookApi.svelte";

    import type { queriedBookFull } from "$appTypes";


    interface Props {
        volumeId: string | undefined;
        getBookPromise?: Promise<queriedBookFull> | undefined;
        open?: boolean;
        summary_text?: string;
        query?: string | undefined;
    }

    let {
        volumeId = $bindable(),
        getBookPromise = $bindable(),
        open = true,
        summary_text = "Add API data?",
        query = $bindable()
    }: Props = $props();

</script>

<details {open}>
    <summary class="text-lg">{summary_text}</summary>
    <div>
        <BookApi
            bind:getBookPromise
            bind:volumeId
            bind:query
            label="Add API data" />
    </div>
</details>
