import { useMutation } from "@tanstack/react-query";
import * as customerService from "@/services/customer/customer.service";
import type { CustomerRequest } from "@/services/customer/customer-types";

export const useAddOrUpdateCustomer = () => {
  return useMutation({
    mutationFn: ({ accountId, model }: { accountId: string; model: CustomerRequest }) =>
      customerService.addOrUpdateCustomer(accountId, model),
  });
};

export const useNormalizeAddress = () => {
  return useMutation({
    mutationFn: (accountId: string) => customerService.normalizeAddress(accountId),
  });
};

export const useSubmitKycInfo = () => {
  return useMutation({
    mutationFn: ({ accountId, model }: { accountId: string; model: any }) =>
      customerService.submitKycInfo(accountId, model),
  });
};

export const useSubmitKycImages = () => {
  return useMutation({
    mutationFn: ({ accountId, formData }: { accountId: string; formData: FormData }) =>
      customerService.submitKycImages(accountId, formData),
  });
};
