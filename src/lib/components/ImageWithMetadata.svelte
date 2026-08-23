<script lang="ts">
    import type { Snippet } from "svelte";
    import Image, { type ImageProps } from "./Image.svelte";

    interface Props extends ImageProps {
        uploadedFile?: File;
        ImageDataSnippet?: Snippet<[ImageData]>;
    }

    let { uploadedFile, ImageDataSnippet, ...rest }: Props = $props();

    type ImageData = {
        width: number;
        height: number;
        type?: string;
        sizeMB?: string | undefined;
    };
    let imageData: ImageData | undefined = $state();

    function imageLoaded(event: Event) {
        const img = event.currentTarget as HTMLImageElement;

        imageData = {
            width: img.naturalWidth,
            height: img.naturalHeight,
            type: uploadedFile?.type,
            sizeMB: uploadedFile?.size
                ? (uploadedFile.size / 1024 / 1024).toFixed(2)
                : undefined,
        };
    }
</script>

<div>
    <Image {...rest} onload={imageLoaded} />
    {#if imageData}
        {#if ImageDataSnippet}
            {@render ImageDataSnippet(imageData)}
        {:else}
            <p>
                {imageData.sizeMB ? `${imageData.sizeMB} MB` : ""}
                {imageData.type}
                {imageData.width} x {imageData.height}
            </p>
        {/if}
    {/if}
</div>
