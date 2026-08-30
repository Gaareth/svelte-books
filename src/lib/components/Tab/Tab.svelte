<script lang="ts">
    import { getContext, onMount } from "svelte";

    import { twMerge } from "tailwind-merge";

    import { TABS, type TabsContext } from "./TabGroup.svelte";
    interface Props {
        children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();

    const thisTab = {};
    const {
        registerTab,
        selectTab,
        selectedTab,
        btnClass,
        btnSelectedClass,
        offsetLeft,
        tabWidth,
    } = getContext<TabsContext>(TABS);
    registerTab(thisTab);

    const updateSlider = (target: HTMLButtonElement | undefined | null) => {
        $offsetLeft = target?.offsetLeft ?? 0;
        $tabWidth = target?.clientWidth ?? 0;
    };

    const select = (e: Event) => {
        selectTab(thisTab);
        // console.log(e.target.offsetLeft);
        const target = e.target as HTMLButtonElement | null;
        updateSlider(target);
    };

    let clientWidth: number | undefined = $state();

    $effect(() => {
        if ($selectedTab == thisTab && clientWidth != null) {
            $tabWidth = clientWidth;
        }
    });

    // update pos of slider, if the page is resized
    let buttonElement: HTMLButtonElement | undefined = $state();
    onMount(() => {
        const observer = new ResizeObserver(([entry]) => {
            updateSlider(entry.target as HTMLButtonElement);
        });

        if (buttonElement) {
            observer.observe(buttonElement);
        }

        return () => {
            if (buttonElement) {
                observer.unobserve(buttonElement);
            }
        };
    });
</script>

<button
    bind:this={buttonElement}
    class={twMerge(btnClass, $selectedTab === thisTab && btnSelectedClass)}
    onclick={select}
    type="button"
    bind:clientWidth>
    {@render children?.()}
</button>
