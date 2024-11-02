<script lang="ts">
  import { onMount } from "svelte";

  export let src: string;
  export let alt: string;

  let loaded = false;
  let image: HTMLImageElement;

  onMount(() => {
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
