import { useQueryClient } from "@tanstack/react-query";
import { governanceKeys } from "./governanceKeys";
import { useUserVotes } from "./useUserVotes";
import { GovernanceData } from "../../types/governance";
import { useCallback } from "react";
import { useProposals } from "./useProposals";
import { useUserBalance } from "./useUserBalance";
import { useGovernanceStats } from "./useGovernanceStats";

export function useGovernanceData(): GovernanceData {
  const queryClient = useQueryClient();

  // Fetch proposals
  const { data: proposals = [], isLoading: loadingProposals } = useProposals();

  // Fetch user's MASOG balance
  const { data: userMasogBalance = null, isLoading: loadingBalance } =
    useUserBalance();

  // Fetch user's votes
  const { data: userVotes = {}, isLoading: loadingUserVotes } =
    useUserVotes(proposals);

  // Calculate stats using the new hook
  const stats = useGovernanceStats(proposals);

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
      loadingBalance ||
      loadingUserVotes,
    refresh,
  };
}
