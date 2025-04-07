import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContractStore } from "../../store/useContractStore";
import { governanceKeys } from "../queryKeys/governance";
import { useUserVotes } from "./useUserVotes";
import { useMasogTotalSupply } from "./useMasogData";
import { calculateStats } from "../../utils/governance";
import { GovernanceData } from "../../types/governance";
import { useCallback } from "react";
import { useProposals } from "./useProposals";
import { useUserBalance } from "./useUserBalance";

export function useGovernanceData(): GovernanceData {
  const { governancePublic } = useContractStore();
  const queryClient = useQueryClient();

  // Fetch proposals
  const { data: proposals = [], isLoading: loadingProposals } = useProposals();

  // Fetch total votes
  const { data: totalVotes = 0n, isLoading: loadingTotalVotes } = useQuery({
    queryKey: governanceKeys.all,
    queryFn: async () => {
      if (!governancePublic) {
        throw new Error("Governance contract not initialized");
      }

      try {
        return await governancePublic.getTotalNbVotes();
      } catch (error) {
        console.error("[Error] Error fetching total votes:", error);
        throw error;
      }
    },
    refetchInterval: 5000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governancePublic,
  });

  // Fetch user's MASOG balance
  const { data: userMasogBalance = null, isLoading: loadingBalance } =
    useUserBalance();

  // Fetch user's votes
  const { data: userVotes = {}, isLoading: loadingUserVotes } =
    useUserVotes(proposals);

  // Calculate stats
  const { data: totalSupply } = useMasogTotalSupply();
  const stats = calculateStats(
    proposals,
    totalSupply ?? null,
    userMasogBalance,
    totalVotes
  );

  // Refresh function
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: governanceKeys.all });
  }, [queryClient]);

  return {
    proposals,
    stats,
    userMasogBalance,
    userVotes,
    proposalVotesMap: {}, // Empty object as this is now handled separately
    loading:
      loadingProposals ||
      loadingTotalVotes ||
      loadingBalance ||
      loadingUserVotes,
    refresh,
  };
}
