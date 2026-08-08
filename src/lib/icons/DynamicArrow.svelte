<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import { clamp } from "../utils/utils";





    interface Props {
        length?: number;
        minThickness?: number;
        maxThickness?: number;
        thicknessRatio?: number;
        headLengthFactor?: number;
        headWidthFactor?: number;
        className?: string;
        colorStart?: string | undefined;
        colorEnd?: any;
        [key: string]: any
    }

    let {
        length = 200,
        minThickness = 4,
        maxThickness = 8,
        thicknessRatio = 0.04,
        headLengthFactor = 4,
        headWidthFactor = 5,
        className = "",
        colorStart = undefined,
        colorEnd = colorStart,
        ...rest
    }: Props = $props();

    let thickness = $derived(clamp(length * thicknessRatio, minThickness, maxThickness));
    let headLength = $derived(thickness * headLengthFactor);
    let headWidth = $derived(thickness * headWidthFactor);

    const gradientId = `grad-${Math.random().toString(36).slice(2)}`;

    const defaultColor = $derived(colorStart ? `url(#${gradientId})` : "currentColor");
</script>

<svg
    viewBox={`0 0 ${length} ${headWidth}`}
    class={twMerge("arrow text-neutral-900 dark:text-neutral-100", className)}
    {...rest}>
    <defs>
        <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2={length}
            y2="0"
            gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color={colorStart} />
            <stop offset="100%" stop-color={colorEnd} />
        </linearGradient>
    </defs>

    <line
        x1="0"
        y1={headWidth / 2}
        x2={length - headLength}
        y2={headWidth / 2}
        stroke={defaultColor}
        stroke-width={thickness}
        stroke-linecap="round" />

    <polygon
        points={`
      ${length - headLength},0
      ${length},${headWidth / 2}
      ${length - headLength},${headWidth}
    `}
        fill={defaultColor} />
</svg>

<style>
    .arrow {
        width: 100%;
        height: auto;
        display: block;
    }
</style>
