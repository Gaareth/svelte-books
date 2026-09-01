import type { ImageLinksType } from "$src/app";

export function getNextImageByResolution(
    imageLinksJSON: string,
    resolution: keyof ImageLinksType,
    reverseOrder: boolean = false,
    overflowToFill: boolean = false,
) {
    const defaultOrder: (keyof ImageLinksType)[] = [
        "extraLarge",
        "large",
        "medium",
        "small",
        "thumbnail",
        "smallThumbnail",
    ];

    if (reverseOrder) {
        defaultOrder.reverse();
    }

    const order = defaultOrder.slice(
        defaultOrder.indexOf(resolution),
        defaultOrder.length,
    );

    // add the remaining resolutions to the end of the order if overflowToFill is true
    if (overflowToFill) {
        const remainingResolutions = defaultOrder.filter(
            (res) => !order.includes(res),
        );
        order.push(...remainingResolutions);
    }

    return getImageByResolutionOrder(imageLinksJSON, order);
}

export function getImageByResolutionOrder(
    imageLinksJSON: string,
    order: (keyof ImageLinksType)[],
) {
    const imageLinks = JSON.parse(imageLinksJSON || "{}") as ImageLinksType;

    for (const res of order) {
        if (imageLinks?.[res]) {
            return imageLinks[res];
        }
    }

    return null;
}

export function getMaxResolutionImage(imageLinksJSON: string) {
    return getNextImageByResolution(imageLinksJSON, "extraLarge");
}

export function getMinResolutionImage(imageLinksJSON: string) {
    return getNextImageByResolution(imageLinksJSON, "smallThumbnail", true);
}
