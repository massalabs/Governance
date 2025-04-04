import { useUserBalance } from "./useUserBalance";

export function useUserMassaBalance() {
  const { data: balance } = useUserBalance({
    refetchInterval: 5000, // 5 seconds
  });

  return balance;
}
