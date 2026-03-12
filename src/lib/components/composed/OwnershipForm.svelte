<script lang="ts">
  import DateSelector, {
    DEFAULT_OPTIONAL_DATETIME,
    formatOptionalDate,
    type OptionalDate,
  } from "$components/input/DateSelector.svelte";
  import InputAny from "$components/input/InputAny.svelte";
  import InputText from "$components/input/InputText.svelte";
  import ToggleGroup from "$components/input/ToggleGroup.svelte";
  import { OWNERSHIP_VALUES } from "$lib/constants/enums";
  import AddLocation from "$lib/icons/AddLocation.svelte";
  import EventDone from "$lib/icons/EventDone.svelte";
  import type { BookOwnership } from "$prismaClient";
  import { capitalize } from "$utils/utils";
  import { twMerge } from "tailwind-merge";

  export let className = "";
  export let editable = true;
  export let optional = false;
  export let error: Record<string, any> | undefined = undefined;

  export let bookOwnership: BookOwnership | null = null;

  export let location: string | null = null;
  export let acquiredAtDate: OptionalDate = DEFAULT_OPTIONAL_DATETIME;
</script>

<div class={twMerge(className, "mb-2")}>
  {#if editable}
    <p>Do you own the book?</p>
  {/if}

  {#if !editable && !bookOwnership}
    <p class="text-secondary">Unknown ownership</p>
  {:else}
    <ToggleGroup
      {editable}
      error={error?.bookOwnership}
      deselectable={true}
      options={[...OWNERSHIP_VALUES]}
      displayFn={capitalize}
      wrapperClass="mb-7 mt-1"
      groupClass="flex"
      btnClass="px-4 py-1 hover:bg-gray-50 dark:hover:bg-gray-500 dark:disabled:hover:bg-slate-600 border border-s-0 dark:border-slate-500 dark:bg-slate-600"
      btnSelectedClass="dark:bg-slate-500 bg-gray-100 dark:disabled:hover:bg-slate-500"
      startClass="border-s rounded-s-md"
      endClass="rounded-e-md"
      bind:selectedOption={bookOwnership} />
    <input type="hidden" name="bookOwnership" value={bookOwnership} />
  {/if}
  {#if bookOwnership != null || !optional}
    <div class="grid grid-cols-2 gap-y-2">
      <InputText
        hasIcon={true}
        error={error?.location}
        id="location"
        name="location"
        displayName="Location:"
        type="text"
        disabled={!editable}
        class="rounded-md dark:bg-slate-600 dark:border-slate-500 w-full btn-generic-color-2"
        bind:value={location}>
        <span class="w-5 block" title="add location" slot="icon">
          <AddLocation />
        </span>
      </InputText>

      <div class="col-span-2 grid grid-cols-1 sm:grid-cols-2">
        <InputAny name="dateStarted" error={error?.dateStarted}>
          <div class="icon-wrapper" slot="label">
            <span class="w-5 block" title="date acquired">
              <EventDone />
            </span>
            Date acquired:
          </div>

          <div slot="input">
            {#if editable}
              <DateSelector
                name="dateStarted"
                id="dateStarted"
                className="w-full sm:w-auto"
                inputClassName="btn-generic-color-2 rounded-md w-full"
                bind:datetime={acquiredAtDate} />
            {:else}
              <p>{formatOptionalDate(acquiredAtDate)}</p>
            {/if}
          </div>
        </InputAny>
      </div>
    </div>
  {/if}
</div>
