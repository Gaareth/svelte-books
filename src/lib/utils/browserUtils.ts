import toast from "svelte-french-toast";

export async function copyToClipboard(code: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Copied registration link to clipboard");
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  } else {
    console.warn("Clipboard API not supported.");
  }
}
