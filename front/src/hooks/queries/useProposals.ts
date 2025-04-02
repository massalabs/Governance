import { useContractStore } from "@/store/useContractStore";
import { formatProposal } from "@/utils/governance";
import { useQuery } from "@tanstack/react-query";
import { governanceKeys } from "../queryKeys/governance";

export const useProposals = () => {
  const { governancePublic } = useContractStore();

  return useQuery({
    queryKey: governanceKeys.proposals(),
    queryFn: async () => {
      if (!governancePublic)
        throw new Error("Governance contract not initialized");

      try {
        const fetchedProposals = await governancePublic.getProposals();

        return fetchedProposals
          .map(formatProposal)
          .sort((a, b) => Number(b.id - a.id));
      } catch (error) {
        console.error("[Error] Error fetching proposals:", error);
        throw error;
      }
    },
    refetchInterval: 10000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governancePublic,
    staleTime: 30000,
  });
};
