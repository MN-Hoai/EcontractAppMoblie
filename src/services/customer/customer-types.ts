/**
 * Customer domain types
 */

export interface CustomerRequest {
  fullName: string;
  phone?: string;
  email?: string;
  isCA: boolean;
}

export interface NormalizeAddressResponse {
  success?: boolean;
  message?: string;
  data?: any;
}
