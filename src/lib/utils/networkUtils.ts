import { delay } from "./utils";

export async function fetchRetry(
    fetchFn: () => Promise<Response>,
    retries = 3,
    delayMs = 1000,
): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetchFn();

            if (response.ok) {
                return response;
            }

            // Retry on 5xx errors
            if (response.status < 500) {
                return response;
            }

            lastError = new Error(`HTTP ${response.status}`);
        } catch (error) {
            lastError = error;
        }

        if (attempt < retries) {
            const jitter = Math.random() * 50;
            await delay(delayMs * 2 ** attempt + jitter); // Exponential backoff
        }
    }

    throw lastError;
}
