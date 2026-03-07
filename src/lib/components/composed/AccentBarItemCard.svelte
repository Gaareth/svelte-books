<script>
  import clsx from "clsx";

  export let wrapperClass = "";
  export let barClass = "";
</script>

<div
  {...$$restProps}
  class={clsx("item-border mb-3 p-2 items-center w-full gap-2", wrapperClass)}>
  <div
    class={clsx(
      "min-h-10 min-w-1 w-1 basis-1 flex-shrink-0 rounded-md",
      barClass
    )}
    style="height: 98%;" />

  <slot />
</div>
