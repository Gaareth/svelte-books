<script lang="ts">
    import clsx from "clsx";

    interface Props {
        images: string[];
        imageWidth?: number;
        aspectRatio?: number;

        gapPx?: number;
        rotationDegree?: number;
        scrollSeconds?: number;
        animate?: boolean;

        fillBehaviour?: "overflow" | "stretch-images" | "center";
        addCornerRows?: boolean;

        wrapperClassName?: string;
        overlayBackgroundClassName?: string;
    }

    let {
        images,
        imageWidth = 145,
        aspectRatio = 1.5,
        gapPx = 5,
        rotationDegree = -15,
        scrollSeconds = 60,
        animate = true,
        fillBehaviour = "overflow",
        addCornerRows = true,

        wrapperClassName = "",
        overlayBackgroundClassName = "",
    }: Props = $props();

    let gridWrapper: HTMLDivElement | undefined = $state(undefined);
    let gridWidth = $state(0);
    let gridHeight = $state(0);

    $effect(() => {
        if (!gridWrapper) return;

        const observer = new ResizeObserver(([entry]) => {
            gridWidth = entry.contentRect.width;
            gridHeight = entry.contentRect.height;
        });

        observer.observe(gridWrapper);

        return () => observer.disconnect();
    });

    const TARGET_IMAGE_WIDTH = $derived(imageWidth);
    const TARGET_IMAGE_HEIGHT = $derived(imageWidth * aspectRatio);

    const IMAGE_HEIGHT = $derived.by(() => {
        if (fillBehaviour === "stretch-images") {
            const rows = Math.max(
                1,
                Math.round(
                    safeNullDivison(gridHeight, TARGET_IMAGE_HEIGHT + gapPx),
                ),
            );
            return safeNullDivison(gridHeight, rows);
        }
        return TARGET_IMAGE_HEIGHT;
    });

    // rescale to target aspect ratio
    const IMAGE_WIDTH = $derived(
        IMAGE_HEIGHT * (TARGET_IMAGE_WIDTH / TARGET_IMAGE_HEIGHT),
    );

    const imageClass = `transition-all duration-300 relative bg-background-elevated text-transparent object-cover object-center rounded drop-shadow-lg`;

    const safeNullDivison = (a: number, b: number) => (b === 0 ? 0 : a / b);

    const columns = $derived(
        Math.ceil(safeNullDivison(gridWidth, IMAGE_WIDTH)),
    );
    const rows = $derived.by(() => {
        let numRows = safeNullDivison(gridHeight, IMAGE_HEIGHT);
        if (addCornerRows) {
            numRows += 2;
        }

        if (fillBehaviour == "center") {
            return Math.floor(numRows);
        }
        return Math.ceil(numRows);
    });


    // this is to make sure that wenn rows changes, the previous rows stay the same
    // results in smoother transitions
    let imageRows = $state<string[][]>([]);
    $effect(() => {
        if (columns <= 0 || images.length === 0) return;

        const targetRows = rows;

        // Remove excess rows
        imageRows.length = targetRows;

        // Create/fix rows
        for (let i = 0; i < targetRows; i++) {
            if (imageRows[i]?.length === columns) continue;

            imageRows[i] = new Array(columns).fill(undefined).map((_, j) => {
                const index = (j * targetRows + i) % images.length;
                return images[index];
            });
        }
    });

    // this might only cover the top left corner not sure.
    const translationOffsetY = $derived(
        Math.sin((rotationDegree * Math.PI) / 180) * gridWidth,
    );

    $effect(() => {
        console.log(rows);
    });
</script>

{#snippet Image(src: string)}
    <img
        {src}
        class={imageClass}
        alt="book cover"
        style="width: {IMAGE_WIDTH}px; height: {IMAGE_HEIGHT}px;"
        fetchpriority="high"
        loading="eager" />
{/snippet}

<!-- skew(-5deg, -15deg) -->
{#snippet Row(images: string[], className?: string)}
    <div class={clsx("flex flex-row", className)} style="gap: {gapPx}px;">
        {#each images as src, i (i)}
            {@render Image(src)}
        {/each}
    </div>
{/snippet}

{#snippet InfiniteRow(images: string[], scrollDirection: "left" | "right")}
    <div>
        <div
            class={clsx(
                "flex w-max",
                scrollDirection == "left" ? "scroll-left" : "scroll-right",
            )}
            style="gap: {gapPx}px; animation-duration: {scrollSeconds}s; animation-play-state: {animate
                ? 'running'
                : 'paused'};">
            {@render Row(images)}
            {@render Row(images)}
        </div>
    </div>
{/snippet}

<div
    class={clsx(
        "overflow-hidden absolute w-full h-full grid-container",
        wrapperClassName,
    )}>
    <div
        class={clsx(
            "absolute top-0 !z-10 w-full h-full",
            overlayBackgroundClassName,
        )}>
    </div>
    <div
        class={clsx(
            "flex flex-col w-full h-full blur-[2px]",
            fillBehaviour == "center" && "justify-center",
        )}
        style="gap: {gapPx}px; transform: rotate({rotationDegree}deg) translateY({translationOffsetY}px);"
        bind:this={gridWrapper}>
        {#each imageRows as imageRow, i (i)}
            {@render InfiniteRow(imageRow, i % 2 === 0 ? "left" : "right")}
        {/each}
    </div>
</div>


<style>
    .scroll-left {
        animation: scroll-left linear infinite;
    }

    .scroll-right {
        animation: scroll-right linear infinite;
    }

    @keyframes scroll-left {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(-50%);
        }
    }

    @keyframes scroll-right {
        from {
            transform: translateX(-50%);
        }
        to {
            transform: translateX(0);
        }
    }

    /* .grid-container::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;

        background: #1e293bF0;
    } */

    .grid-container::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;

        backdrop-filter: blur(7px);
        background: linear-gradient(
            to right,
            rgb(0 0 0 / 0.5),
            transparent 25%,
            transparent 75%,
            rgb(0 0 0 / 0.5)
        );
        mask-image: linear-gradient(
            to right,
            black,
            transparent 30%,
            transparent 70%,
            black
        );
    }
</style>
