<script lang="ts">
  export let value: unknown;
  export let name: string;
  export let displayName: string = name;
  // export let type: string = "text"
  export let error: string | undefined;
</script>

<label for={name} class="capitalize">{displayName}:</label>
<div class="flex flex-col mb-3 sm:mb-0">
  <input
    id={name}
    {name}
    type="text"
    class="input w-full {error ? 'input-error' : ''}"
    bind:value
  />
  <label for={name} class="label">
    {#if error}
      <span class="label-text-alt text-error">{error}</span>
    {/if}
  </label>
</div>
