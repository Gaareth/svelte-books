<script lang="ts">
  export let value: Object;
  export let name: string;
  // export let type: string = "text"
  export let error: string | undefined;
  console.log("error " + error);
  
</script>

<label for="name">{name.charAt(0).toUpperCase() + name.slice(1)}:</label>
<div class="flex flex-col">
  <input id={name} {name} type="text" class="input w-full {!!error ? "input-error" : ""}" bind:value />
  <label for="name" class="label">
    {#if !!error}
      <span class="label-text-alt text-error">{error}</span>
    {/if}
  </label>
</div>
