import type { Action } from "svelte/action";

interface ClickOutsideEvent {
    onclick_outside: (event: CustomEvent) => void;
}

export const clickOutside: Action<
    HTMLDivElement,
    undefined,
    ClickOutsideEvent
> = (node) => {
    const handleClick = (event: MouseEvent) => {
        if (
            node &&
            !node.contains(event.target as Node) &&
            !event.defaultPrevented
        ) {
            node.dispatchEvent(
                new CustomEvent("click_outside", {
                    detail: event.target,
                }),
            );
        }
    };

    document.addEventListener("click", handleClick, true);

    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        },
    };
};
