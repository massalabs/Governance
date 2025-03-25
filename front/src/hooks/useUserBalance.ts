import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "../store/useContractStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { governanceKeys } from "./queryKeys/governance";

export const useUserBalance = () => {
  const { masOg } = useContractStore();
  const { connectedAccount } = useAccountStore();

  return useQuery({
    queryKey: governanceKeys.userBalance(),
    queryFn: async () => {
      if (!masOg?.public || !connectedAccount) {
        console.error("MasOg contract not initialized or no account connected");
        return null;
      }

      try {
        const balance = await masOg.public.balanceOf(connectedAccount.address);
        return balance;
      } catch (error) {
        console.error("[Error] Error fetching MASOG balance:", error);
        throw error;
      }
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!masOg?.public && !!connectedAccount,
    staleTime: 15000,
  });
};
