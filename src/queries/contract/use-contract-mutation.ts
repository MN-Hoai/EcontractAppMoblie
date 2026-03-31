import { useMutation } from "@tanstack/react-query";
import * as contractService from "@/services/contract/contract.service";

export const useCheckCaStatus = () => {
  return useMutation({
    mutationFn: (accountId: string) => contractService.checkCaStatus(accountId),
  });
};

export const useOrderCA = () => {
  return useMutation({
    mutationFn: (accountId: string) => contractService.orderCA(accountId),
  });
};

export const useViewOrder = () => {
  return useMutation({
    mutationFn: (accountId: string) => contractService.viewOrder(accountId),
  });
};

export const useOrderInfo = () => {
  return useMutation({
    mutationFn: (accountId: string) => contractService.getOrderInfo(accountId),
  });
};

export const useApproveHandOver = () => {
  return useMutation({
    mutationFn: (accountId: string) => contractService.approveHandOver(accountId),
  });
};
