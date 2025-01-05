<script context="module" lang="ts">
  export const TABS = {};
  export interface TabsContext {
    registerTab: (tab: any) => void;
    registerPanel: (panel: any) => number;
    setPanelRef: (idx: number, panelRef: any) => void;
    selectTab: (tab: any) => void;
    selectedTab: ReturnType<typeof writable>;
    selectedPanel: ReturnType<typeof writable>;
    currentTabIdx: ReturnType<typeof writable<number>>;
    btnClass: string;
    btnSelectedClass: string;
    animate: boolean;
    offsetLeft: ReturnType<typeof writable<number>>;
    tabWidth: ReturnType<typeof writable<number>>;
  }
</script>

<script lang="ts">
  // https://svelte.dev/playground/8e68120858e5322272dc9136c4bb79cc
  import { setContext, onDestroy } from "svelte";
  import { writable } from "svelte/store";
  import { twMerge } from "tailwind-merge";
  import Tab from "./Tab.svelte";

  const tabs: any[] = [];
  const panels: any[] = [];
  const selectedTab = writable(null);
  const selectedPanel = writable(null);
  const currentTabIdx = writable(0);

  const panelRefs = [];

  export let className: string | undefined = undefined;
  export let btnClass: string | undefined = undefined;
  export let btnSelectedClass: string | undefined = undefined;
  export let sliderClass: string | undefined = undefined;
  export let animate: boolean = true;

  let offsetLeft = writable(0);
  let tabWidth = writable(0);

  setContext(TABS, {
    registerTab: (tab: any) => {
      tabs.push(tab);
      selectedTab.update((current) => current || tab);

      onDestroy(() => {
        const i = tabs.indexOf(tab);
        tabs.splice(i, 1);
        selectedTab.update((current) =>
          current === tab ? tabs[i] || tabs[tabs.length - 1] : current
        );
      });
    },

    registerPanel: (panel: any) => {
      panels.push(panel);
      selectedPanel.update((current) => current || panel);

      onDestroy(() => {
        const i = panels.indexOf(panel);
        panels.splice(i, 1);
        selectedPanel.update((current) =>
          current === panel ? panels[i] || panels[panels.length - 1] : current
        );
      });
      return panels.length - 1;
    },

    setPanelRef: (idx: number, panelRef: any) => {
      panelRefs[idx] = panelRef;
    },

    selectTab: (tab: any) => {
      // console.log(panelRefs[currentTabIdx]);
      // panelRefs[currentTabIdx].style.cssText = `
      // transform: translateX(-${103.33 * 1}%);`;

      const i = tabs.indexOf(tab);
      selectedTab.set(tab);
      selectedPanel.set(panels[i]);
      $currentTabIdx = i;
    },

    currentTabIdx,
    selectedTab,
    selectedPanel,

    btnClass,
    btnSelectedClass,

    offsetLeft,
    tabWidth,

    animate,
  });

  export let tabNames: string[];
</script>

<div class={twMerge(animate && "overflow-x-hidden", className)}>
  <div class="flex justify-center my-2">
    <div class="relative">
      {#each tabNames as tab, i (tab)}
        <Tab>{tab}</Tab>
      {/each}

      <span
        class="absolute bottom-0 flex overflow-hidden rounded-3xl transition-all duration-300"
        style={`left: ${$offsetLeft}px; width: ${$tabWidth}px`}
      >
        <span class={twMerge("h-full w-full", sliderClass)} />
      </span>
    </div>
  </div>
  <slot />
</div>
