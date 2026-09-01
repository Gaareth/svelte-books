export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function arrMax(arr: number[]) {
    if (arr.length === 0) {
        return undefined;
    }

    let maxValue = arr[0];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > maxValue) {
            maxIndex = i;
            maxValue = arr[i];
        }
    }

    return { maxIndex, maxValue };
}

export function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return String(error);
}

export const sum = (list: number[]) => list.reduce((a, b) => a + b, 0);
export const zip = (a: unknown[], b: unknown[]) => a.map((k, i) => [k, b[i]]);

export function undefinedToNull<Type>(any: Type | undefined): Type | null {
    return any === undefined ? null : any;
}

export function nullToUndefined<Type>(any: Type | null): Type | undefined {
    return any === null ? undefined : any;
}

export function capitalize(status: string) {
    if (!status) return status;

    return status
        .split("_")
        .map((word) => word[0] + word.slice(1).toLowerCase())
        .join(" ");
}

export function decapitalize(status: string) {
    return status
        .split(" ")
        .map((word) => word.toUpperCase())
        .join("_");
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
export function uniq<T>(a: T[]): T[] {
    const prims: Record<string, Set<unknown>> = {
        boolean: new Set(),
        number: new Set(),
        string: new Set(),
    };
    const objs: T[] = [];

    return a.filter((item) => {
        const type = typeof item;
        if (type in prims) {
            if (prims[type].has(item)) {
                return false;
            }
            prims[type].add(item);
            return true;
        } else {
            if (objs.includes(item)) {
                return false;
            }
            objs.push(item);
            return true;
        }
    });
}

export function uniqBy<T, K>(a: T[], key: (item: T) => K): T[] {
    const seen: Record<string, boolean> = {};

    return a.filter((item) => {
        const k = key(item) as unknown as string; // Ensure compatibility with `Record<string, boolean>`
        return Object.prototype.hasOwnProperty.call(seen, k)
            ? false
            : (seen[k] = true);
    });
}

export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
