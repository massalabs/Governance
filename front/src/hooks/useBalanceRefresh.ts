import { useQuery } from "@tanstack/react-query";
import { useAccountStore } from "@massalabs/react-ui-kit";

export const useBalanceRefresh = () => {
  const { connectedAccount, refreshBalance, balance } = useAccountStore();

  return useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!connectedAccount) return null;
      await refreshBalance(false);
      return balance || 0n;
    },
    refetchInterval: 5000,
    enabled: !!connectedAccount,
  });
};
