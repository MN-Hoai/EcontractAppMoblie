/**
 * Signing domain types
 */

export interface CloudCaInsertSignPayload {
  contractId: string;
  fieldName: string;
  signatureBase64: string;
}

export interface CloudCaHashPayload {
  contractId: string;
  signImageBase64: string;
  certChainBase64: string[];
}
