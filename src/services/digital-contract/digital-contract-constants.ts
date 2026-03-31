/**
 * Digital Contract service endpoints & query keys
 */

export const DIGITAL_CONTRACT_ENDPOINTS = {
  LIST: "/contract/api/list",
} as const;

/**
 * Query keys for React Query
 */
export const DIGITAL_CONTRACT_KEYS = {
  all: ["digital-contract"] as const,
  list: (tab: string, page: number, limit: number, keyword: string) =>
    [...DIGITAL_CONTRACT_KEYS.all, "list", tab, page, limit, keyword] as const,
};
