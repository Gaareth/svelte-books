<script lang="ts">
  export let value: Object | null;
  export let name: string;
  export let displayName: string = name;
  // export let type: string = "text"
  export let error: string | undefined;  
</script>

<label for="name" class="capitalize">{displayName}:</label>
<div class="flex flex-col">
  <input id={name} {name} type="number" pattern="[0-9]*" inputmode="numeric"
  class="input w-full {!!error ? "input-error" : ""}" bind:value />
  <label for="name" class="label">
    {#if !!error}
      <span class="label-text-alt text-error">{error}</span>
    {/if}
  </label>
</div>
