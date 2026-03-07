<script lang="ts">
  export let name: string;
  export let displayName: string | undefined = undefined;
  // export let type: string = "text"
  export let error: string | undefined = undefined;
</script>

<label for={name} class="capitalize">
  <slot name="label">{displayName}:</slot>
</label>
<div class="flex flex-col mb-3 sm:mb-0">
  <slot name="input" />

  {#if error}
    <span class="label-text-alt text-error">{error}</span>
  {/if}
</div>
