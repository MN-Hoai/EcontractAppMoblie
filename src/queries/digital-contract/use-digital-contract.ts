import { useQuery } from "@tanstack/react-query";
import * as digitalContractService from "@/services/digital-contract/digital-contract.service";
import { DIGITAL_CONTRACT_KEYS } from "@/services/digital-contract/digital-contract-constants";

export const useDigitalContracts = (
  tab: string,
  page: number,
  limit: number = 10,
  keyword: string = "",
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: DIGITAL_CONTRACT_KEYS.list(tab, page, limit, keyword),
    queryFn: () =>
      digitalContractService.getDigitalContracts(tab, page, limit, true, keyword),
    enabled,
  });
};
