export type SSE_EVENT = { msg: string; max: number; items: number };

export const SSE_DATA: Map<string, SSE_EVENT> = new Map();