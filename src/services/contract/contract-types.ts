/**
 * Contract domain types
 */

export interface Contract {
  id?: string;
  contractName: string;
  contractPath: string;
  contractDate: string;
  status: number;
}

export interface ContractApiResponse {
  message: string;
  data: Contract[];
  totalCount: number;
}

export interface FdfData {
  [key: string]: string | number | boolean;
}

export interface CheckCaResponse {
  success?: boolean;
  message?: string;
  data?: boolean;
}

export interface OrderCAResponse {
  success?: boolean;
  message?: string;
  data?: any;
}

export interface OrderInfoData {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  permanentAddress?: string;
  orderId?: string;
}

export interface OrderInfoResponse {
  success?: boolean;
  message?: string;
  data?: OrderInfoData;
}
