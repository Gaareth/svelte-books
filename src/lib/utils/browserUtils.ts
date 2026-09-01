import { resolve } from "$app/paths";
import toast from "svelte-french-toast";
import { sineInOut } from "svelte/easing";
import { publicConfig } from "../config/public";
import type { THEME } from "../stores/stores";

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

export function slideHeight(node: Element) {
    const style = getComputedStyle(node);
    const height = parseFloat(style.height);

    return {
        duration: 550,
        css: (t: number) => `height: ${t * height}px; overflow: hidden;`,
        easing: sineInOut,
    };
}
export const isDarkModeEnabled = (theme: THEME, window: Window): boolean => {
    return (
        theme == "dark" ||
        (theme == "system" &&
            window &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
};
export const replaceStateWithQuery = (values: Record<string, string>) => {
    const url = new URL(window.location.toString());
    for (const [k, v] of Object.entries(values)) {
        if (v) {
            url.searchParams.set(k, v);
        } else {
            url.searchParams.delete(k);
        }
    }
    history.replaceState(history.state, "", url);
};
