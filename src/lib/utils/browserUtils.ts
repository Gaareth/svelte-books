import { resolve } from "$app/paths";
import toast from "svelte-french-toast";
import { publicConfig } from "../config/public";

export async function copyToClipboard(code: string, successMessage?: string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(code);
            toast.success(successMessage ?? "Copied to clipboard");
        } catch (err) {
            console.error("Failed to copy text:", err);
        }
    } else {
        console.warn("Clipboard API not supported.");
    }
}

export function makeUploadUrl(url: string): string | undefined {
    if (!publicConfig.imageUploads.urlPrefix) {
        return undefined;
    }

    const prefix = publicConfig.imageUploads.urlPrefix.replace(
        /^\/+|\/+$/g,
        "",
    );
    const path = url.replace(/^\/+/, "");

    return `/${prefix}/${path}`;
}

export function resolveAPIImageUrl(url: string): string {
    return resolve(`/api/book-covers?url=${encodeURIComponent(url)}`);
}
