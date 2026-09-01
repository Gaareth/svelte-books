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

export const parseDuration = (value: string): number => {
    const regex =
        /^(\d+)(ms|millisecond|milliseconds|s|sec|second|seconds|min|minute|minutes|h|hour|hours|d|day|days)$/;
    const match = value.match(regex);

    if (!match) {
        throw new Error(
            `Invalid duration format: ${value}. Expected formats: 100ms, 5s, 10min, 2h, 1d`,
        );
    }

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case "ms":
        case "millisecond":
        case "milliseconds":
            return amount;
        case "s":
        case "sec":
        case "second":
        case "seconds":
            return amount * 1000;
        case "m":
        case "min":
        case "minute":
        case "minutes":
            return amount * 60 * 1000;
        case "h":
        case "hour":
        case "hours":
            return amount * 60 * 60 * 1000;
        case "d":
        case "day":
        case "days":
            return amount * 24 * 60 * 60 * 1000;
        default:
            throw new Error(`Unknown duration unit: ${unit}`);
    }
};

export const parseSize = (value: string): number => {
    const regex = /^(\d+)(B|KB|MB|GB)$/;
    const match = value.match(regex);

    if (!match) {
        throw new Error(
            `Invalid size format: ${value}. Expected formats: 100B, 5KB, 10MB, 2GB`,
        );
    }

    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case "B":
            return amount;
        case "KB":
            return amount * 1000;
        case "MB":
            return amount * 1000 ** 2;
        case "GB":
            return amount * 1000 ** 3;
        default:
            throw new Error(`Unknown size unit: ${unit}`);
    }
};

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
        required,
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
