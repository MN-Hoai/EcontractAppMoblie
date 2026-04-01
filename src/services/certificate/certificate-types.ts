/**
 * Certificate domain types
 */

export interface CertificateCloudCaInfo {
  id: number;
  requestId: string;
  fromDate?: string;
  toDate?: string;
  issuer?: string;
  serialNumber?: string;
  subject?: string;
  createdDate?: string;
}

export interface CertInfo {
  id?: number;
  requestId: string;
  credentialId?: string;
  subscriberId?: string;
  phoneNumber?: string;
  certStatus?: string;
  issuerDN?: string;
  subjectDN?: string;
  serialNumber?: string;
  validFrom?: string;
  validTo?: string;
}

export interface CertInfoResponse {
  success?: boolean;
  message?: string;
  data?: CertInfo[];
}

export interface CertificateItem {
  credentialId?: string;
  certificateData?: string[];
}

export interface CertificatesResponse {
  success?: boolean;
  message?: string;
  data?: CertificateItem[];
}
