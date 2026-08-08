<script lang="ts">
    import InputAll from "./InputAll.svelte";

    
  interface Props {
    value?: unknown | undefined;
    name: string;
    displayName?: string;
    // export let type: string = "text"
    error: string | undefined;
    hasIcon?: boolean;
    icon?: import('svelte').Snippet;
    [key: string]: unknown;
  }

  let {
    value = $bindable(),
    name,
    displayName = name,
    error,
    hasIcon = false,
    icon,
    ...rest
  }: Props = $props();
</script>

<!-- <label for={name} class="capitalize">{displayName}:</label>
<div class="flex flex-col mb-3 sm:mb-0">
  <input
    id={name}
    {name}
    type="text"
    class="input w-full {error ? 'input-error' : ''}"
    bind:value />
  <label for={name} class="label">
    {#if error}
      <span class="label-text-alt text-error">{error}</span>
    {/if}
  </label>
</div> -->

<InputAll {displayName} {name} {error} {...rest} bind:value>
    {#snippet label()}
    <label  for={name} class="capitalize">
          {#if hasIcon}
              <div class="icon-wrapper">
                  {@render icon?.()}
                  {displayName}
              </div>
          {:else}
              {displayName}
          {/if}
      </label>
  {/snippet}
</InputAll>
