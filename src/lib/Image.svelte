<script lang="ts">
  import { onMount } from "svelte";

  export let src: string | null | undefined;
  export let alt: string;

  let loaded = false;
  let image: HTMLImageElement;

  onMount(() => {
    if (!src) {
      loaded = false;
      return;
    }

    image.src = src;

    image.onload = () => {
      // console.log("loaded");

      loaded = true;
    };
  });
</script>

<img
  src={loaded ? src : "/cover.png"}
  {alt}
  {...$$restProps}
  bind:this={image}
/>
