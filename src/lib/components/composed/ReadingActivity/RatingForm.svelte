<script lang="ts">
    import clsx from "clsx";

    import InputNumber from "../../input/InputNumber.svelte";
    import LineChartDrawer from "../../input/LineChartDrawer.svelte";
    import Rating from "../../Rating.svelte";

    import { Prisma } from "$src/generated/prisma/browser";
    import { MAX_RATING } from "$src/lib/constants/constants";

    // optional rating and storygraphs
    type CurrentlyReadingEntry = Prisma.ReadingActivityGetPayload<{
        include: {
            dateStarted: true;
            dateFinished: true;
            status: true;
            book: true;
        };
    }> & {
        rating?: Prisma.ReadingActivityGetPayload<{
            include: { rating: true };
        }>["rating"];
        storyGraphs?: Prisma.ReadingActivityGetPayload<{
            include: { storyGraphs: true };
        }>["storyGraphs"];
    };

    export let entry: CurrentlyReadingEntry | undefined = undefined;
    export let create = false;

    let stars = entry?.rating?.stars;

    let tensionGraph =
        entry?.storyGraphs && entry?.storyGraphs?.length > 0
            ? {
                  labels: JSON.parse(entry.storyGraphs[0].labels),
                  details: JSON.parse(entry.storyGraphs[0].details),
                  data: JSON.parse(entry.storyGraphs[0].data),
                  title: entry.storyGraphs[0].title,
              }
            : {
                  title: "tension", // the rest is default in the component
              };
</script>

<div class="my-2">
    <h2 class="text-xl">
        <label for="stars">Rating</label>
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
        <div>
            <InputNumber
                inputClass="py-0.5 text-center btn-generic-color-2"
                name="stars"
                type="number"
                step="0.5"
                bind:value={stars}
                min="0"
                max={MAX_RATING}
                skipLabel={true}
                clearButton={true} />
        </div>

        <div class="flex sm:justify-center">
            <Rating
                bind:rating={stars}
                rating_max={MAX_RATING}
                editable={true} />
        </div>
    </div>
</div>

<section>
    <details>
        <summary
            class={clsx(
                "cursor-pointer text-xl",
                !entry?.rating?.comment && !create && "text-secondary"
            )}>
            Comment
        </summary>
        <textarea
            class="w-full input dark:bg-slate-600"
            name="comment"
            id="comment"
            value={entry?.rating?.comment ?? ""}
            rows="5" />
    </details>
</section>

<section>
    <details>
        <summary
            class={clsx(
                "cursor-pointer text-xl",
                entry?.storyGraphs?.length == 0 && !create && "text-secondary"
            )}>
            Story graphs
        </summary>
        <div class="default-border p-2 dark:bg-slate-600">
            <LineChartDrawer
                allowEdits={true}
                bgColorDark="#64748b"
                inputClassName="dark:bg-slate-500 dark:border-slate-500"
                bind:title={tensionGraph.title}
                bind:labels={tensionGraph.labels}
                bind:details={tensionGraph.details}
                bind:data={tensionGraph.data} />
            <input
                type="hidden"
                name="graphs[title]"
                value={tensionGraph.title} />
            <input
                type="hidden"
                name="graphs[labels]"
                value={JSON.stringify(tensionGraph.labels)} />
            <input
                type="hidden"
                name="graphs[details]"
                value={JSON.stringify(tensionGraph.details)} />
            <input
                type="hidden"
                name="graphs[data]"
                value={JSON.stringify(tensionGraph.data)} />
        </div>
    </details>
</section>
