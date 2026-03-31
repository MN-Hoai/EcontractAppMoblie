import { useMutation } from "@tanstack/react-query";
import * as signingService from "@/services/signing/signing.service";
import type { CloudCaHashPayload, CloudCaInsertSignPayload } from "@/services/signing/signing-types";

export const useCloudCaHash = () => {
  return useMutation({
    mutationFn: (payload: CloudCaHashPayload) => signingService.getCloudCaHash(payload),
  });
};

export const useGetSignature = () => {
  return useMutation({
    mutationFn: (params: {
      filename: string;
      certificateId: string;
      filehash: string;
      contractId: string;
      accountId: string;
    }) =>
      signingService.getSignature(
        params.filename,
        params.certificateId,
        params.filehash,
        params.contractId,
        params.accountId
      ),
  });
};

export const useInsertCloudCaSign = () => {
  return useMutation({
    mutationFn: (payload: CloudCaInsertSignPayload) =>
      signingService.insertCloudCaSign(payload),
  });
};

export const useConfirmSign = () => {
  return useMutation({
    mutationFn: (accountId: string) => signingService.confirmSign(accountId),
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: (accountId: string) => signingService.resendOtp(accountId),
  });
};

export const useConfirmOtp = () => {
  return useMutation({
    mutationFn: ({ accountId, otpCode }: { accountId: string; otpCode: string }) =>
      signingService.confirmOtp(accountId, otpCode),
  });
};
