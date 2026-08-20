export function requiredEnv(
    env: Record<string, string | undefined>,
    key: string,
): string {
    const value = env[key];

    if (value === undefined || value === "") {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
}

export const parseCommaSeparatedList = (value: string): string[] => {
    return value.split(",").map((item) => item.trim());
};

export const parseBool = (value: string): boolean => {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    throw new Error(`Expected "true" or "false", got "${value}"`);
};

export const parseInt = (value: string): number => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0) {
        throw new Error(`Expected a non-negative integer, got "${value}"`);
    }

    return parsed;
};

export const nonEmpty = (value: string): string => {
    if (!value.trim()) {
        throw new Error("Value must not be empty");
    }

    return value;
};

export function readEnv<T>(
    env: Record<string, string | undefined>,
    key: string,
    parseFn: (value: string) => T,
    options: { fallback: T; warn?: boolean },
): T;

export function readEnv<T>(
    env: Record<string, string | undefined>,
    key: string,
    parseFn: (value: string) => T,
    options?: { required?: boolean; warn?: boolean },
): T | undefined;

export function readEnv<T>(
    env: Record<string, string | undefined>,
    key: string,
    parseFn: (value: string) => T,
    {
        fallback,
        warn = false,
        required = fallback === undefined,
    }: {
        fallback?: T;
        warn?: boolean;
        required?: boolean;
    } = {},
): T | undefined {
    const value = env[key];

    if (value === undefined || value === "") {
        if (fallback !== undefined) {
            if (warn) {
                console.warn(
                    `Environment variable ${key} is not set, using fallback: ${fallback}`,
                );
            }

            return fallback;
        }

        if (required) {
            throw new Error(`Missing required environment variable: ${key}`);
        }

        return undefined;
    }

    try {
        return parseFn(value);
    } catch (error) {
        throw new Error(`Error parsing environment variable ${key}`, {
            cause: error,
        });
    }
}
export function createEnvReader(env: Record<string, string | undefined>) {
    function value<T>(
        key: string,
        parse: (value: string) => T,
        options: { fallback: T; warn?: boolean },
    ): T;

    // no fallback? => can be undefined
    function value<T>(
        key: string,
        parse: (value: string) => T,
        options?: { warn?: boolean },
    ): T | undefined;

    function value<T>(
        key: string,
        parse: (value: string) => T,
        options: { fallback?: T; warn?: boolean } = {},
    ): T | undefined {
        return readEnv(env, key, parse, options);
    }

    function required<T>(key: string, parse: (value: string) => T): T {
        return readEnv(env, key, parse, { required: true }) as T;
    }

    function requiredWhen<T>(
        key: string,
        parse: (value: string) => T,
        isRequired: boolean,
    ): T | undefined {
        return readEnv(env, key, parse, { required: isRequired });
    }

    return {
        value,
        required,
        requiredWhen,
    };
}
