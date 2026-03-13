<script lang="ts">
  import toast from "svelte-french-toast";
  import { twMerge } from "tailwind-merge";

  import AddApiButton from "$components/composed/Settings/AddApiButton.svelte";
  import ApiResult from "$components/composed/Settings/ApiResult.svelte";
  import ReloadButton from "$components/composed/Settings/ReloadButton.svelte";

  import type { PageData } from "./$types.js";
  import type { SSE_EVENT } from "$src/routes/book/api/update_all/sse";

  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import ToggleGroup from "$lib/components/input/ToggleGroup.svelte";
  import { capitalize, decapitalize } from "$lib/utils/utils";
  import {
    VISIBILITY_TYPES,
    VISIBILITY_VALUES,
    PRIVATE,
    AUTHENTICATED,
    UNLISTED,
    PUBLIC,
    type VisibilityType,
  } from "$lib/constants/enums";
  import { Visibility } from "$src/generated/prisma/enums.js";

  export let form;
  export let data: PageData;
  // let originalData = data;
  // $: dataChanged = originalData != data;
  // $: {
  //   console.log("same", originalData == data);
  //   console.log(data);
  //   console.log(originalData);

  // }

  let currentStatus: SSE_EVENT | undefined = undefined;

  //TODO: toast
  // let globalVisibility = "private";

  let allAsGlobal;
  $: allAsGlobal = data.readingActivityLists
    .filter((v) => v.visibility != null)
    .every((v) => (v.visibility as VisibilityType) == globalVisibility);

  let globalVisibility = data.globalVisibility;

  $: {
    if (form?.success) {
      toast.success("Successfully applied changes");
    }
  }

  // $: sortedSupportedVisibilites = [PRIVATE, AUTHENTICATED, UNLISTED, PUBLIC]; //TODO: support unlisted
  $: sortedSupportedVisibilites = [PRIVATE, AUTHENTICATED, PUBLIC];

  function changeAllVisiblities(ev: CustomEvent) {
    const option = ev.detail;
    for (let i = 0; i < data.readingActivityLists.length; i++) {
      data.readingActivityLists[i].visibility = option;
    }
  }

  async function resetForm() {
    await invalidateAll();
    globalVisibility = data.globalVisibility;
  }
</script>

<h1 class="text-5xl my-4">Settings</h1>

<section>
  <h2>Visibility</h2>

  <form method="POST" action="?/editVisibility" use:enhance>
    <div
      class="gap-2 flex flex-wrap justify-between border generic-border p-4 items-center">
      <div class="max-w-52">
        <p>Global visibilty</p>
        <p class="text-secondary text-base break-words">
          Applies to all lists as a fallback value.
        </p>
      </div>
      <div>
        <ToggleGroup
          options={sortedSupportedVisibilites}
          displayFn={capitalize}
          btnClass="px-4 py-1 border border-s-0 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 flex items-center gap-1 break-all"
          btnSelectedClass="dark:bg-slate-700 bg-gray-50"
          startClass="border-s rounded-s-md"
          endClass="rounded-e-md"
          bind:selectedOption={globalVisibility}
          on:select={changeAllVisiblities}
          defaultOption={globalVisibility == PRIVATE ? 0 : 1} />
        <!-- <input
          type="hidden"
          name="isPublic"
          value={data.globalVisibility == "public"} /> -->

        <input type="hidden" name="globalVisibility" value={globalVisibility} />

        <p class="text-secondary text-base">
          Info:
          {#if globalVisibility == PRIVATE}
            Only you have access
          {:else if globalVisibility == AUTHENTICATED}
            Access requires an account
          {:else if globalVisibility == PUBLIC}
            Everyone has access
          {:else if globalVisibility == UNLISTED}
            Only people with the link have access
          {:else}
            Unknown visibility
          {/if}
        </p>

        {#if !allAsGlobal}
          <p class="text-warning text-base -mb-1">
            Warning: Atleast one list is different.
          </p>
        {/if}
      </div>
    </div>

    <div class="mt-4 mb-2">
      <h3 class="text-2xl font-medium">Reading Activity Lists</h3>
    </div>
    <div class="flex flex-col gap-2">
      {#each data.readingActivityLists as list, i}
        <div
          class={twMerge(
            "gap-2 flex flex-wrap justify-between border generic-border p-4 items-center",
            data.readingActivityLists[i].visibility != globalVisibility &&
              data.readingActivityLists[i].visibility &&
              "border-warning"
          )}>
          <p>{capitalize(list.status)}</p>

          <ToggleGroup
            options={sortedSupportedVisibilites}
            displayFn={capitalize}
            btnClass="px-4 py-1 border border-s-0 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 flex items-center gap-1 break-all"
            btnSelectedClass="dark:bg-slate-700 bg-gray-50"
            startClass="border-s rounded-s-md"
            endClass="rounded-e-md"
            deselectable={true}
            bind:selectedOption={data.readingActivityLists[i].visibility} />
          <input
            type="hidden"
            name={`readingActivityVisibility[${list.status}]`}
            value={data.readingActivityLists[i].visibility} />
        </div>
      {/each}
    </div>
    <div class="mt-3 flex gap-2 justify-end">
      <button type="button" class="btn-generic" on:click={resetForm}>
        Cancel
      </button>
      <button type="submit" class="btn-primary-black w-36 flex justify-center">
        Save
      </button>
    </div>
  </form>
</section>

<section>
  <h2>Datasource</h2>
  <div class="flex flex-col gap-6 sm:gap-8">
    <ReloadButton bind:currentStatus />
    <AddApiButton bind:currentStatus />

    <ApiResult {form} {currentStatus} />
  </div>
  <!-- SOON -->
</section>

<style>
  h2 {
    margin: 1rem 0;
    font-size: 1.75rem;
    line-height: 2rem;
    /* font-weight: bold; */
  }
</style>
