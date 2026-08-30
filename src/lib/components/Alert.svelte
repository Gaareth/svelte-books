<script lang="ts">
    import clsx from "clsx";
    import type { Snippet } from "svelte";

    interface Props {
        type: "info" | "warning" | "error";
        children?: Snippet;
        className?: string;
        [key: string]: any;
    }

    let { type, className, children, ...rest }: Props = $props();

    const typeClasses = {
        info: "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
        warning:
            "bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100",
        error: "bg-red-100 border-red-400 text-red-700 dark:bg-red-900 dark:text-red-100",
    };
</script>

<div
    class={clsx("border rounded px-4 py-3 my-3", typeClasses[type], className)}
    role="alert"
    {...rest}>
    {@render children?.()}
</div>
