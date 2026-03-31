/**
 * Signing service endpoints & query keys
 */

export const SIGNING_ENDPOINTS = {
  CLOUD_CA_HASH: "/contract/api/cloudca-get-hash",
  INSERT_SIGN: "/contract/api/cloudca-insert-sign",
  GET_SIGNATURE: (params: {
    filename: string;
    certificateId: string;
    filehash: string;
    contractId: string;
    accountId: string;
  }) =>
    `/api/get-signature?filename=${encodeURIComponent(params.filename)}&certificateId=${encodeURIComponent(params.certificateId)}&filehash=${encodeURIComponent(params.filehash)}&contractId=${encodeURIComponent(params.contractId)}&accountId=${encodeURIComponent(params.accountId)}`,
  CONFIRM_SIGN: (accountId: string) =>
    `/api/confirm-sign?accountId=${accountId}`,
  RESEND_OTP: (accountId: string) =>
    `/api/resend-otp?accountId=${accountId}`,
  CONFIRM_OTP: (accountId: string, otpCode: string) =>
    `/api/confirm-otp?accountId=${accountId}&otpCode=${otpCode}`,
} as const;

/**
 * Query keys for React Query
 */
export const SIGNING_KEYS = {
  all: ["signing"] as const,
};
