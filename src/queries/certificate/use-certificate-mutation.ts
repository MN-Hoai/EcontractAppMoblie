import { useMutation } from "@tanstack/react-query";
import * as certificateService from "@/services/certificate/certificate.service";

export const useImportCertificate = () => {
  return useMutation({
    mutationFn: (accountId: string) => certificateService.importCertificate(accountId),
  });
};
