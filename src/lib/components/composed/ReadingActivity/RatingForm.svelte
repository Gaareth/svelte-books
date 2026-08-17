<script lang="ts">
    import { untrack } from "svelte";

    import clsx from "clsx";

    import InputNumber from "../../input/InputNumber.svelte";
    import LineChartDrawer from "../../input/LineChartDrawer.svelte";
    import Rating from "../../Rating.svelte";

    import { Prisma } from "$prismaBrowser";
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

    interface Props {
        entry?: CurrentlyReadingEntry | undefined;
        create?: boolean;
    }

    let { entry = undefined, create = false }: Props = $props();

    const toGraph = (e?: CurrentlyReadingEntry) => {
        const g = e?.storyGraphs?.[0];
        if (!g) {
            return {
                title: "tension",
                labels: [] as string[],
                details: [] as string[],
                data: [] as number[],
            };
        }
        return {
            title: g.title,
            labels: JSON.parse(g.labels) as string[],
            details: JSON.parse(g.details) as string[],
            data: JSON.parse(g.data) as number[],
        };
    };

    // $state, not $derived — these are bound to, and $state is what gives
    // you a deep proxy so child mutations propagate back up here.
    // If `entry` can swap without a remount, wrap this component
    // in {#key entry?.id} where it's used.
    let tensionGraph = $state(untrack(() => toGraph(entry)));
    let stars = $state(untrack(() => entry?.rating?.stars));

    let graphDetails: HTMLDetailsElement | undefined = $state();
    let drawer: ReturnType<typeof LineChartDrawer> | undefined = $state();
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
                !entry?.rating?.comment && !create && "text-secondary",
            )}>
            Comment
        </summary>
     
        <textarea
            class="w-full input dark:bg-slate-600"
            name="comment"
            id="comment"
            rows="5">{entry?.rating?.comment ?? ""}</textarea>
    </details>
</section>

<section>
    <details
        bind:this={graphDetails}
        ontoggle={() => {
            if (graphDetails?.open) drawer?.resize();
        }}>
        <summary
            class={clsx(
                "cursor-pointer text-xl",
                entry?.storyGraphs?.length == 0 && !create && "text-secondary",
            )}>
            Story graphs
        </summary>
        <div class="default-border p-2 dark:bg-slate-600">
            <LineChartDrawer
                bind:this={drawer}
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
