<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import Image from "./Image.svelte";

    interface Props {
        allowedTypes: string[];
        maxFileSize: number;
        label: string;
        name: string;
        form?: string;
        id?: string;
    }

    let {
        allowedTypes,
        maxFileSize,
        label,
        name,
        form,
        id = `ImageUpload-${uuidv4()}`,
    }: Props = $props();

    let previewImage = $state<string | undefined>();
    let uploadedFile: File | undefined = $state();

    function handleChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            previewImage = URL.createObjectURL(file);
            uploadedFile = file;
        }
    }

    let imageData:
        | {
              width: number;
              height: number;
              type?: string;
              sizeMB?: string | undefined;
          }
        | undefined = $state();

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

<label for={id}>{label}:</label>

<input
    {form}
    type="file"
    {id}
    {name}
    class="input btn-generic-color-2"
    accept={allowedTypes.map((t) => `image/${t}`).join(", ")}
    onchange={handleChange} />

<p class="text-sm text-secondary" id="file_input_help">
    {allowedTypes.map((t) => t.toUpperCase()).join(", ")} (MAX. {maxFileSize /
        1024 /
        1024} MB).
</p>

{#if previewImage}
    <div class="w-full flex items-center justify-center mt-5">
        <Image
            src={previewImage}
            onload={imageLoaded}
            alt="Preview of the uploaded image"
            backgroundClass="rounded"
            class="max-h-64 object-contain rounded" />
    </div>
    {#if imageData}
        <p class="ml-auto">
            {imageData.sizeMB}MB {imageData.type}
            {imageData.width} x {imageData.height}
        </p>
    {/if}
{/if}
