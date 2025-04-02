import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "../../store/useContractStore";

// Query keys
export const masogKeys = {
  all: ["masog"] as const,
  totalSupply: () => [...masogKeys.all, "totalSupply"] as const,
};

export function useMasogTotalSupply() {
  const { masOgPublic } = useContractStore();

  return useQuery({
    queryKey: masogKeys.totalSupply(),
    queryFn: async () => {
      if (!masOgPublic) throw new Error("MasOg contract not initialized");
      return masOgPublic.totalSupply();
    },
    enabled: !!masOgPublic,
    staleTime: 5 * 60 * 1000, // Consider masog total supply stale after 5 minutes
  });
}
