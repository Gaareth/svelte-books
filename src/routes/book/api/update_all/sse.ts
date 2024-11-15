import type { SETTINGS_SSE_ACTIONS } from "../../../settings/+page.server";

export type SSE_EVENT = { msg: string; max: number; items: number; id: SETTINGS_SSE_ACTIONS };

export const SSE_DATA: { [accountId: string]: SSE_EVENT } = {};
