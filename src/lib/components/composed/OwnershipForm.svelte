<script lang="ts">
  import DateSelector, {
    type OptionalDate,
  } from "$components/input/DateSelector.svelte";
  import ToggleGroup from "$components/input/ToggleGroup.svelte";
  import { OWNERSHIP_VALUES } from "$lib/constants/enums";
  import EventDone from "$lib/icons/EventDone.svelte";
  import { capitalize } from "$utils/utils";
  import { twMerge } from "tailwind-merge";

  export let className = "";
  export let showQuestion = true;
  export let editable = true;

  let selectedOwnership: string | undefined = undefined;

  let name: string;
  let dateAcquired: OptionalDate;
</script>

<div class={twMerge(className)}>
  {#if showQuestion}
    <p>Do you own the book?</p>
  {/if}

  {#if !editable && !selectedOwnership}
    <p class="text-secondary">Unknown ownership</p>
  {:else}
    <ToggleGroup
      unToggleable={true}
      options={[...OWNERSHIP_VALUES].map((v) => capitalize(v))}
      groupClass="mb-5 mt-1 inline-flex"
      btnClass="px-4 py-1 hover:bg-gray-50 dark:hover:bg-gray-500 border border-s-0 dark:border-slate-500 dark:bg-slate-600"
      btnSelectedClass="dark:bg-slate-500 bg-gray-100"
      startClass="border-s rounded-s-md"
      endClass="rounded-e-md"
      bind:selectedOption={selectedOwnership} />
    <input type="hidden" name="bookOwnership" value={selectedOwnership} />
  {/if}

  <div class="grid grid-cols-2 gap-y-2">
    <label for="location">Location:</label>
    <input
      id="location"
      name="location"
      type="text"
      class="rounded-md dark:bg-slate-600 dark:border-slate-500 w-full btn-generic-color-2"
      bind:value={name} />

    <label
      class="col-span-2 grid grid-cols-1 sm:grid-cols-2"
      for="acquiredAtDate">
      <div class="icon-wrapper">
        <span class="w-5 block" title="date acquired">
          <EventDone />
        </span>
        Date acquired:
      </div>

      <DateSelector
        name="acquiredAtDate"
        id="acquiredAtDate"
        className="w-full sm:w-auto"
        inputClassName="btn-generic-color-2 rounded-md w-full"
        bind:datetime={dateAcquired} />
    </label>
  </div>
</div>
