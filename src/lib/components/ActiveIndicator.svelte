<script lang="ts">
  import { twMerge } from "tailwind-merge";

  export let size: "sm" | "md" | "lg" = "md";

  const sizeClass = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }[size];

  let colorClass = "bg-red-500";
</script>

<span class="relative flex">
  <span
    class={twMerge(
      `absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping duration-[2000ms]`,
      colorClass
    )} />
  <span
    class={twMerge(
      `relative inline-flex rounded-full`,
      colorClass,
      sizeClass
    )} />
</span>
