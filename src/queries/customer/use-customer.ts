import { useQuery } from "@tanstack/react-query";
import * as customerService from "@/services/customer/customer.service";
import { CUSTOMER_KEYS } from "@/services/customer/customer-constants";

export const useCheckCustomerExist = (accountId: string | null) => {
  return useQuery({
    queryKey: CUSTOMER_KEYS.checkExist(accountId!),
    queryFn: () => customerService.checkCustomerExist(accountId!),
    enabled: !!accountId,
  });
};

export const useGetIdNumber = (accountId: string | null) => {
  return useQuery({
    queryKey: CUSTOMER_KEYS.idNumber(accountId!),
    queryFn: () => customerService.getIdNumber(accountId!),
    enabled: !!accountId,
  });
};
