import { useQuery } from "@tanstack/react-query";

import { useAccountStore } from "@massalabs/react-ui-kit";
import { useContractStore } from "@/store/useContractStore";
import { governanceKeys } from "../queryKeys/governance";

interface UseUserBalanceOptions {
  refetchInterval?: number;
}

export const useUserBalance = (options: UseUserBalanceOptions = {}) => {
  const { masOgPublic } = useContractStore();
  const { connectedAccount } = useAccountStore();

  return useQuery({
    queryKey: governanceKeys.userBalance(),
    queryFn: async () => {
      if (!masOgPublic || !connectedAccount) {
        console.error("MasOg contract not initialized or no account connected");
        return null;
      }

      try {
        const balance = await masOgPublic.balanceOf(connectedAccount.address);
        return balance;
      } catch (error) {
        console.error("[Error] Error fetching MASOG balance:", error);
        throw error;
      }
    },
    refetchInterval: options.refetchInterval ?? 5000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!masOgPublic && !!connectedAccount,
    staleTime: 15000,
  });
};
