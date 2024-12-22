<script lang="ts">
  import { enhance } from "$app/forms";
  import LoadingSpinner from "$lib/LoadingSpinner.svelte";

  import ReloadButton from "./ReloadButton.svelte";

  import AddApiButton from "./AddApiButton.svelte";
  import ApiResult from "./ApiResult.svelte";
  import type { SSE_EVENT } from "../book/api/update_all/sse";
  import ToggleGroup from "$lib/ToggleGroup.svelte";
  import { listenArrayEvents } from "chart.js/helpers";
  import type { PageData } from "./$types.js";
  import { twMerge } from "tailwind-merge";
  import { invalidateAll } from "$app/navigation";
  import toast from "svelte-french-toast";

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
  type visibility = "public" | "private";
  // let globalVisibility = "private";

  let allAsGlobal;
  $: allAsGlobal = data.lists
    .filter((v) => v.visibility != null)
    .every((v) => (v.visibility as visibility) == data.globalVisibility);
  $: {
    console.log(data.lists);
    console.log(data.globalVisibility);
  }

  $: {
    console.log(form);

    if (form?.success) {
      toast.success("Successfully applied changes");
    }
  }
</script>

<h1 class="text-5xl my-4">Settings</h1>

<section>
  <h2>Visibility</h2>

  <form method="POST" action="?/editVisibility" use:enhance>
    <div
      class="gap-2 flex flex-wrap justify-between border generic-border p-4 items-center"
    >
      <div>
        <p>Global visibilty</p>
        <p class="text-secondary text-base">
          Applies to all lists as a fallback value.
          {#if !allAsGlobal}
            <span class="text-warning text-base hidden sm:inline"
              >Warning: Atleast one list is different.</span
            >
          {/if}
        </p>
      </div>
      <ToggleGroup
        options={["private", "public"]}
        groupClass="inline-flex border rounded-md dark:border-slate-500 dark:bg-slate-600"
        btnClass="px-4 py-1 dark:hover:bg-slate-500 hover:bg-gray-50 lowercase"
        btnSelectedClass="dark:bg-slate-500 bg-gray-100"
        on:select={(ev) => {
          const option = ev.detail;
          data.globalVisibility = option;
          // data.lists = Array(data.lists.length).fill(option);
          for (let i = 0; i < data.lists.length; i++) {
            data.lists[i].visibility = option;
          }
        }}
        defaultOption={data.globalVisibility == "private" ? 0 : 1}
      />
      <input
        type="hidden"
        name="isPublic"
        value={data.globalVisibility == "public"}
      />
    </div>

    <div class="flex items-center justify-between mt-4 mb-2">
      <h3 class="text-2xl font-medium">Lists</h3>
      {#if !allAsGlobal}
        <span class="text-warning text-base inline sm:hidden"
          >Warning: Atleast one list is different.</span
        >
      {/if}
    </div>
    <div class="flex flex-col gap-2">
      {#each data.lists as list, i}
        <div
          class={twMerge(
            "gap-2 flex flex-wrap justify-between border generic-border p-4 items-center",
            data.lists[i].visibility != data.globalVisibility &&
              data.lists[i].visibility &&
              "border-warning"
          )}
        >
          <p>{list.name}</p>

          <ToggleGroup
            options={["private", "public"]}
            groupClass="inline-flex border rounded-md dark:border-slate-500 dark:bg-slate-600"
            btnClass="px-4 py-1 text-base dark:hover:bg-slate-500 hover:bg-gray-50 lowercase"
            btnSelectedClass="dark:bg-slate-500 bg-gray-100"
            unToggleable={true}
            bind:selectedOption={data.lists[i].visibility}
          />
          <input
            type="hidden"
            name={`listNameVisibility[${list.name}]`}
            value={data.lists[i].visibility}
          />
        </div>
      {/each}
    </div>
    <div class="mt-3 flex gap-2 justify-end">
      <button
        type="button"
        class="btn-generic"
        on:click={async () => {
          await invalidateAll();
        }}
      >
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
  <!-- <div class="flex flex-col gap-6 sm:gap-8">
    <ReloadButton bind:currentStatus />
    <AddApiButton bind:currentStatus />

    <ApiResult {form} {currentStatus} />
  </div> -->
  SOON
</section>

<style>
  h2 {
    margin: 1rem 0;
    font-size: 1.75rem;
    line-height: 2rem;
    /* font-weight: bold; */
  }
</style>
