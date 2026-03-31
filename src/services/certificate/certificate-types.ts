/**
 * Certificate domain types
 */

export interface CertificateCloudCaInfo {
  id?: number;
  requestId?: string;
  fromDate?: string;
  toDate?: string;
  issuer?: string;
  serialNumber?: string;
  subject?: string;
  createdDate?: string;
  FromDate?: string;
  ToDate?: string;
  Issuer?: string;
  SerialNumber?: string;
  Subject?: string;
}

export interface CertInfo {
  id?: number;
  requestId?: string;
  credentialId?: string;
  subscriberId?: string;
  phoneNumber?: string;
  certStatus?: string;
  issuerDN?: string;
  subjectDN?: string;
  serialNumber?: string;
  validFrom?: string;
  validTo?: string;
  CredentialId?: string;
  SubscriberId?: string;
  PhoneNumber?: string;
  CertStatus?: string;
  IssuerDN?: string;
  SubjectDN?: string;
  SerialNumber?: string;
  ValidFrom?: string;
  ValidTo?: string;
  Id?: number;
}

export interface CertInfoResponse {
  success?: boolean;
  message?: string;
  data?: CertInfo[];
  Success?: boolean;
  Message?: string;
  Data?: CertInfo[];
}

export interface CertificateItem {
  CredentialId?: string;
  CertificateData?: string[];
  credentialId?: string;
  certificateData?: string[];
}

export interface CertificatesResponse {
  Success?: boolean;
  Message?: string;
  Data?: CertificateItem[];
  success?: boolean;
  message?: string;
  data?: CertificateItem[];
}
