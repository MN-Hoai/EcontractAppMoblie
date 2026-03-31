/**
 * Certificate service endpoints & query keys
 */

export const CERTIFICATE_ENDPOINTS = {
  CLOUD_CA_INFO: (accountId: string) =>
    `/api/cloud-ca-info?accountId=${accountId}`,
  IMPORT_CERT: (accountId: string) =>
    `/api/import-cert?accountId=${accountId}`,
  CERT_INFO: (accountId: string, validFrom?: string) =>
    `/api/cert-info?accountId=${accountId}${validFrom ? `&validFrom=${encodeURIComponent(validFrom)}` : ""}`,
  CERTIFICATES: (accountId: string) =>
    `/api/certificates?accountId=${accountId}`,
  CERT_DETAIL: (accountId: string, id: number) =>
    `/api/cert-info-detail?accountId=${accountId}&id=${id}`,
} as const;

/**
 * Query keys for React Query
 */
export const CERTIFICATE_KEYS = {
  all: ["certificate"] as const,
  cloudCaInfo: (accountId: string) =>
    [...CERTIFICATE_KEYS.all, "cloud-ca-info", accountId] as const,
  certInfo: (accountId: string, validFrom?: string) =>
    [...CERTIFICATE_KEYS.all, "cert-info", accountId, validFrom] as const,
  certificates: (accountId: string) =>
    [...CERTIFICATE_KEYS.all, "certificates", accountId] as const,
  certDetail: (accountId: string, id: number) =>
    [...CERTIFICATE_KEYS.all, "cert-detail", accountId, id] as const,
};
