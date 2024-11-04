<script lang="ts">
  import { getContext } from "svelte";
  import { TABS, type TabsContext } from "./TabGroup.svelte";
  import { twMerge } from "tailwind-merge";

  const thisTab = {};
  const { registerTab, selectTab, selectedTab, btnClass, btnSelectedClass } = getContext<TabsContext>(TABS);
  registerTab(thisTab);
</script>

<button
  class={twMerge(btnClass, $selectedTab === thisTab && btnSelectedClass)}
  on:click={() => selectTab(thisTab)}
  type="button"
>
  <slot />
</button>
