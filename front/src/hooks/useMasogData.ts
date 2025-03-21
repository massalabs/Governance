import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "../store/useContractStore";

// Query keys
export const masogKeys = {
  all: ["masog"] as const,
  totalSupply: () => [...masogKeys.all, "totalSupply"] as const,
};

export function useMasogTotalSupply() {
  const { masOg } = useContractStore();

  return useQuery({
    queryKey: masogKeys.totalSupply(),
    queryFn: async () => {
      if (!masOg?.public) throw new Error("MasOg contract not initialized");
      return masOg.public.totalSupply();
    },
    enabled: !!masOg?.public,
    staleTime: 5 * 60 * 1000, // Consider total supply stale after 5 minutes
  });
}
