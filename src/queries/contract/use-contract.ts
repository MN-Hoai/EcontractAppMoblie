import { useQuery } from "@tanstack/react-query";
import * as contractService from "@/services/contract/contract.service";
import { CONTRACT_KEYS } from "@/services/contract/contract-constants";
import type { Contract } from "@/services/contract/contract-types";

export const useContracts = (accountId: string | null) => {
  return useQuery<Contract[]>({
    queryKey: CONTRACT_KEYS.list(accountId!),
    queryFn: () => contractService.getContracts(accountId!),
    enabled: !!accountId,
  });
};

export const useContractFdf = (contractId: string, accountId: string) => {
  return useQuery({
    queryKey: CONTRACT_KEYS.fdf(contractId, accountId),
    queryFn: () => contractService.fetchContractFdf(contractId, accountId),
    enabled: !!contractId && !!accountId,
  });
};

export const useContractWithFdf = (contractId: string, accountId: string) => {
  return useQuery({
    queryKey: CONTRACT_KEYS.withFdf(contractId, accountId),
    queryFn: () => contractService.fetchContractWithFdf(contractId, accountId),
    enabled: !!contractId && !!accountId,
  });
};
