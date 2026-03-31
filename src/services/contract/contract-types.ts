/**
 * Contract domain types
 */

export interface Contract {
  id?: string;
  Id?: string;
  ContractName: string;
  ContractPath: string;
  ContractDate: string;
  Status: number;
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
  Success?: boolean;
  Message?: string;
  Data?: boolean;
  success?: boolean;
  message?: string;
  data?: boolean;
}

export interface OrderCAResponse {
  Success?: boolean;
  Message?: string;
  Data?: any;
  success?: boolean;
  message?: string;
  data?: any;
}

export interface OrderInfoData {
  FullName?: string;
  DateOfBirth?: string;
  Gender?: string;
  PermanentAddress?: string;
  OrderID?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  permanentAddress?: string;
  orderId?: string;
}

export interface OrderInfoResponse {
  Success?: boolean;
  Message?: string;
  Data?: OrderInfoData;
  success?: boolean;
  message?: string;
  data?: OrderInfoData;
}
