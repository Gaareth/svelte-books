<script lang="ts">
    import { Chart } from "chart.js/auto";
    import { getRelativePosition } from "chart.js/helpers";
    import { twMerge } from "tailwind-merge";

    import Modal from "$components/Modal.svelte";
    import { theme } from "$lib/stores/stores";
    import { clamp } from "$lib/utils/utils";
    import { defaultBgColor } from "$utils/chartUtils";

    interface Props {
        allowEdits?: boolean;
        title: string;
        inputClassName?: string;
        labels: string[];
        details: string[];
        data: (number | null)[];
        bgColorDark?: string;
    }

    let {
        allowEdits = false,
        title = $bindable(),
        inputClassName = "",
        labels = $bindable(),
        details = $bindable(),
        data = $bindable(),
        bgColorDark = "#334155",
    }: Props = $props();

    const MIN_V = -10;
    const MAX_V = 10;
    const DEFAULT_LENGTH = 20;

    // Seed empty graphs once, at init — NOT in an $effect.
    // The `.length` check matters: the parent passes [] for new entries, not null.
    if (!labels?.length || !details?.length || !data?.length) {
        labels = Array.from({ length: DEFAULT_LENGTH }, (_, i) => String(i));
        details = new Array(DEFAULT_LENGTH).fill("");
        data = new Array(DEFAULT_LENGTH).fill(0);
    }

    let length = $state(data.length);
    let canvas: HTMLCanvasElement | undefined = $state();

    // raw: reassignment is reactive, but Svelte never proxies the Chart
    // instance itself (Chart.js mutates its own config heavily).
    let chart = $state.raw<Chart | undefined>(undefined);

    // plain mirror the tick callback can read without touching reactive state
    let detailsForTicks: string[] = [];

    // Explicit element-by-element reads register the dependencies, and the
    // result is plain arrays — never hand Chart.js a proxy.
    let plain = $derived({
        labels: labels.map((l) => String(l)),
        details: details.map((d) => d ?? ""),
        data: data.map((v) => v),
        title,
        fg: $theme === "dark" ? "white" : "#0f172a",
        grid: $theme === "dark" ? bgColorDark : "#e2e8f0",
    });

    // --- create / destroy -------------------------------------------------
    $effect(() => {
        if (!canvas) return;

        const c = new Chart(canvas, {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    {
                        data: [],
                        label: "",
                        backgroundColor: defaultBgColor,
                        borderColor: defaultBgColor,
                    },
                ],
            },
            options: {
                responsive: true,
                animation: false,
                spanGaps: true,
                scales: {
                    y: { min: MIN_V, max: MAX_V, grid: {} },
                    x: {
                        grid: {},
                        ticks: {
                            maxRotation: 0,
                            autoSkip: false,
                            callback(value, index) {
                                const label = this.getLabelForValue(
                                    Number(value),
                                );
                                // hide the numeric placeholder labels;
                                // delete this line to show indices instead
                                if (!label || !Number.isNaN(Number(label)))
                                    return "";
                                return detailsForTicks[index]
                                    ? `${label} (!)`
                                    : label;
                            },
                        },
                    },
                },
            },
        });

        chart = c;
        return () => {
            c.destroy();
            chart = undefined;
        };
    });

    // --- sync state -> chart ----------------------------------------------
    $effect(() => {
        const p = plain;
        const c = chart;
        if (!c) return;

        detailsForTicks = p.details;
        c.data.labels = p.labels;
        c.data.datasets[0].data = p.data;
        c.data.datasets[0].label = p.title;

        const { x, y } = c.options.scales as any;
        x.ticks.color = p.fg;
        y.ticks.color = p.fg;
        x.grid.color = p.grid;
        y.grid.color = p.grid;

        c.update();
    });

    // --- drawing ----------------------------------------------------------
    let drawing = false;
    let moved = false;
    let lastIndex = 0;

    let showModal = $state(false);
    let eventInputRef: HTMLInputElement | undefined = $state();
    let selectedLabelIndex: number | undefined = $state();

    const paint = (e: PointerEvent) => {
        if (!chart) return;
        const pos = getRelativePosition(e, chart as any);
        const index = clamp(
            Math.round(chart.scales.x.getValueForPixel(pos.x) ?? 0),
            0,
            data.length - 1,
        );
        const value = clamp(
            chart.scales.y.getValueForPixel(pos.y) ?? 0,
            MIN_V,
            MAX_V,
        );
        lastIndex = index;
        data[index] = Number(value.toFixed(2));
    };

    const onpointerdown = (e: PointerEvent) => {
        if (!allowEdits) return;
        drawing = true;
        moved = false;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        paint(e);
    };

    const onpointermove = (e: PointerEvent) => {
        if (!drawing) return;
        moved = true;
        paint(e);
    };

    const onpointerup = (e: PointerEvent) => {
        if (!drawing) return;
        drawing = false;
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        // a tap without a drag opens the annotation modal
        if (!moved) {
            selectedLabelIndex = lastIndex;
            showModal = true;
        }
    };

    const updateLength = (e: Event) => {
        const v = clamp(
            Number((e.currentTarget as HTMLInputElement).value) || 0,
            2,
            60,
        );
        if (v === data.length) return;

        if (v > data.length) {
            const start = data.length;
            const d = v - start;
            labels.push(
                ...Array.from({ length: d }, (_, i) => String(start + i)),
            );
            details.push(...new Array(d).fill(""));
            data.push(...new Array(d).fill(0));
        } else {
            labels.length = v;
            details.length = v;
            data.length = v;
        }
        length = v;
    };

    // call this from the parent if the chart lives inside a <details>
    export const resize = () => chart?.resize();
</script>

{#if allowEdits}
    <div class="mb-3">
        <div class="flex flex-wrap gap-5">
            <label>
                Title
                <input
                    type="text"
                    class={twMerge("input w-auto", inputClassName)}
                    bind:value={title} />
            </label>

            <label>
                Length ({length})
                <input
                    type="range"
                    class="input w-auto h-full"
                    min="2"
                    max="60"
                    value={length}
                    oninput={updateLength} />
            </label>
        </div>
    </div>
{/if}

<div class="relative">
    <canvas
        bind:this={canvas}
        style:touch-action={allowEdits ? "none" : undefined}
        {onpointerdown}
        {onpointermove}
        {onpointerup}
        onpointercancel={onpointerup}></canvas>
</div>

<Modal
    bind:showModal
    className="max-w-96"
    onOpened={() => eventInputRef?.focus()}>
    {#snippet header()}
        <h1 class="text-2xl">
            Additional information ({selectedLabelIndex})
        </h1>
    {/snippet}
    <div class="my-1 flex flex-col gap-2">
        {#if selectedLabelIndex != null}
            <label class="text-secondary text-base">
                event:
                <input
                    type="text"
                    class="input btn-generic-color-2"
                    bind:this={eventInputRef}
                    bind:value={labels[selectedLabelIndex]} />
            </label>

            <label class="text-secondary text-base">
                details (!):
                <textarea
                    class="input btn-generic-color-2"
                    bind:value={details[selectedLabelIndex]}></textarea>
            </label>
        {:else}
            <p>No label or details available for this point.</p>
        {/if}

        <p class="text-base text-secondary mt-2">
            You can enter some additional information why this point is
            especially important (to you!)
        </p>
    </div>
</Modal>

<style>
    label {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
</style>