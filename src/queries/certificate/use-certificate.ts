import { useQuery } from "@tanstack/react-query";
import * as certificateService from "@/services/certificate/certificate.service";
import { CERTIFICATE_KEYS } from "@/services/certificate/certificate-constants";

export const useCloudCaInfo = (accountId: string | null) => {
  return useQuery({
    queryKey: CERTIFICATE_KEYS.cloudCaInfo(accountId!),
    queryFn: () => certificateService.getCloudCaInfo(accountId!),
    enabled: !!accountId,
  });
};

export const useCertInfo = (accountId: string | null, validFrom?: string) => {
  return useQuery({
    queryKey: CERTIFICATE_KEYS.certInfo(accountId!, validFrom),
    queryFn: () => certificateService.getCertInfo(accountId!, validFrom),
    enabled: !!accountId,
  });
};

export const useCertificates = (accountId: string | null) => {
  return useQuery({
    queryKey: CERTIFICATE_KEYS.certificates(accountId!),
    queryFn: () => certificateService.getCertificates(accountId!),
    enabled: !!accountId,
  });
};

export const useCertificateDetail = (accountId: string | null, id: number | null) => {
  return useQuery({
    queryKey: CERTIFICATE_KEYS.certDetail(accountId!, id!),
    queryFn: () => certificateService.getCertificateDetail(accountId!, id!),
    enabled: !!accountId && id !== null,
  });
};
