export function preventDefault<T extends (event: Event) => unknown>(fn: T): T {
    return function (this: ThisParameterType<T>, event: Event) {
        event.preventDefault();
        return fn.call(this, event);
    } as T;
}
