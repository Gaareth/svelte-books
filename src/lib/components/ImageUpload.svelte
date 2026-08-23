<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import ImageWithMetadata from "./ImageWithMetadata.svelte";

    interface Props {
        uploadedFile?: File | undefined;
        previewImage?: string | undefined;
        allowedTypes: string[];
        maxFileSize: number;
        label: string;
        name: string;
        form?: string;
        id?: string;
    }

    let {
        previewImage = $bindable(),
        uploadedFile = $bindable(),
        allowedTypes,
        maxFileSize,
        label,
        name,
        form,
        id = `ImageUpload-${uuidv4()}`,
    }: Props = $props();

    function handleChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const file = input.files?.[0];

        if (file) {
            previewImage = URL.createObjectURL(file);
            uploadedFile = file;
        }
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
        <ImageWithMetadata
            src={previewImage}
            {uploadedFile}
            alt="Preview of the uploaded image"
            backgroundClass="rounded"
            class="max-h-64 object-contain rounded" />
    </div>
{/if}
