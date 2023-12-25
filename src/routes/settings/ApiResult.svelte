<script lang="ts">
  export let currentStatus: any;
  export let form: any;
</script>

{#if form !== undefined && form !== null}
  <div class="default-border p-3 my-2">
    <slot></slot>
  </div>
{/if}

<p>{form}</p>

{#if currentStatus !== undefined && form && currentStatus.msg != "done"}
  <div class="flex flex-col">
    <div>
      <span>{currentStatus.msg}</span>
      <span>{currentStatus.items}/{currentStatus.max}</span>
    </div>
    <progress max={currentStatus.max} value={currentStatus.items} />
  </div>
{/if}
