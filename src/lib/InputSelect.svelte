<script lang="ts">
  export let value: Object | null;
  export let name: string;
  export let displayName: string = name;

  // export let type: string = "text"
  export let error: string | undefined;
</script>

<label for="name">{displayName}:</label>
<div class="flex flex-col">
  <select bind:value {name} id={name} class="input w-full {!!error ? 'input-error' : ''}">
    <slot />
  </select>
  <label for="name" class="label">
    {#if !!error}
      <span class="label-text-alt text-error">{error}</span>
    {/if}
  </label>
</div>
