/**
 * Customer domain types
 */

export interface CustomerRequest {
  FullName: string;
  Phone?: string;
  Email?: string;
  IsCA: boolean;
}

export interface NormalizeAddressResponse {
  Success?: boolean;
  Message?: string;
  Data?: any;
  success?: boolean;
  message?: string;
  data?: any;
}
