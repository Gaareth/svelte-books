<script lang="ts">
  import clsx from "clsx";
  import { twMerge } from "tailwind-merge";

  export let className: string = "";
</script>

<div
  class={twMerge(
    clsx(
      "inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-slate-700 px-2 text-gray-700 dark:text-gray-50",
      className
    )
  )}
>
  <slot />
</div>
