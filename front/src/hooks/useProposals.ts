import { useQuery } from "@tanstack/react-query";
import { useContractStore } from "../store/useContractStore";
import { governanceKeys } from "./queryKeys/governance";
import { formatProposal } from "../utils/governance";

export const useProposals = () => {
  const { governance } = useContractStore();

  return useQuery({
    queryKey: governanceKeys.proposals(),
    queryFn: async () => {
      if (!governance?.public)
        throw new Error("Governance contract not initialized");

      try {
        const fetchedProposals = await governance.public.getProposals();

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
    enabled: !!governance?.public,
    staleTime: 30000,
  });
};
