<script module lang="ts">
    export interface ImageProps extends HTMLImgAttributes {
        placeholderHash?: string;
        wrapperClass?: string;
        backgroundClass?: string;
        onloadClass?: string;
        onload?: (event: Event) => void;
    }
</script>

<script lang="ts">
    import clsx from "clsx";
    import type { HTMLImgAttributes } from "svelte/elements";
    import { thumbHashToDataURL } from "thumbhash";

    let {
        src,
        alt = "",
        placeholderHash,
        wrapperClass,
        backgroundClass,
        onloadClass,
        class: _class,
        onload,
        ...rest
    }: ImageProps = $props();

    const placeholderUrl = $derived.by(() => {
        if (!placeholderHash) return undefined;

        return thumbHashToDataURL(
            Uint8Array.from(atob(placeholderHash), (c) => c.charCodeAt(0)),
        );
    });

    let loaded = $state(false);
</script>

<div class={clsx("relative overflow-hidden", wrapperClass)}>
    <div
        class:loaded={!loaded}
        class:unloaded={loaded}
        class={clsx(
            "absolute inset-0 w-full h-full bg-gray-200 dark:bg-slate-600 -z-10",
            placeholderUrl
                ? "bg-cover bg-center bg-no-repeat"
                : "animate-pulse",
            backgroundClass,
        )}
        style={placeholderUrl
            ? `background-image: url("${placeholderUrl}")`
            : undefined}>
    </div>

    <img
        {src}
        {alt}
        onload={(event) => {
            loaded = true;
            onload?.(event);
        }}
        class={clsx(loaded && onloadClass, _class)}
        {...rest} />
</div>

<style>
    /* img {
        opacity: 0;
        filter: blur(6px);
        transform: scale(1.02);
        transition:
            opacity 50ms ease,
            filter 50ms ease-in,
            transform 50ms ease;
    }

    img.loaded {
        opacity: 1;
        filter: blur(0);
        transform: scale(1);
    } */

    /* img {
        opacity: 0;
    } */

    .unloaded {
        opacity: 0;
        visibility: hidden;
    }

    .loaded {
        opacity: 1;
    }

    /* Without JS, the image is still visible normally. */
    @media (scripting: none) {
        img {
            opacity: 1;
        }
    }
</style>
