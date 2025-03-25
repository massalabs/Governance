import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContractStore } from "../store/useContractStore";
import { governanceKeys } from "./queryKeys/governance";
import { useProposals } from "./useProposals";
import { useUserBalance } from "./useUserBalance";
import { useUserVotes } from "./useUserVotes";
import { useMasogTotalSupply } from "./useMasogData";
import { calculateStats } from "../utils/governance";
import { GovernanceData, VoteDetails } from "../types/governance";
import { useCallback } from "react";

export function useGovernanceData(): GovernanceData {
  const { governance } = useContractStore();
  const queryClient = useQueryClient();

  // Fetch proposals
  const { data: proposals = [], isLoading: loadingProposals } = useProposals();

  // Fetch total votes
  const { data: totalVotes = 0n, isLoading: loadingTotalVotes } = useQuery({
    queryKey: governanceKeys.all,
    queryFn: async () => {
      if (!governance?.public) {
        throw new Error("Governance contract not initialized");
      }

      try {
        return await governance.public.getTotalNbVotes();
      } catch (error) {
        console.error("[Error] Error fetching total votes:", error);
        throw error;
      }
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governance?.public,
  });

  // Fetch user's MASOG balance
  const { data: userMasogBalance = null, isLoading: loadingBalance } =
    useUserBalance();

  // Fetch user's votes
  const { data: userVotes = {}, isLoading: loadingUserVotes } =
    useUserVotes(proposals);

  // Fetch all proposal votes with details
  const { data: proposalVotesMap = {}, isLoading: loadingProposalVotes } =
    useQuery({
      queryKey: governanceKeys.allProposalVotes(),
      queryFn: async () => {
        if (!governance?.public || !proposals.length) {
          throw new Error("Missing dependencies for fetching proposal votes");
        }

        try {
          const votesMap: Record<string, VoteDetails[]> = {};

          // Get all votes for each proposal
          for (const proposal of proposals) {
            const votes = await governance.public.getVotes(proposal.id);

            // Create vote details for each vote
            const voteDetails: VoteDetails[] = votes.map((voteValue) => ({
              value: BigInt(voteValue),
              address: "Unknown", // We don't have the voter address in the current implementation
              comment: "", // Comments are handled separately via getComments
            }));

            votesMap[proposal.id.toString()] = voteDetails;
          }

          return votesMap;
        } catch (error) {
          console.error("[Error] Error fetching proposal votes:", error);
          throw error;
        }
      },
      refetchInterval: 30000,
      retry: 3,
      retryDelay: 1000,
      enabled: !!governance?.public && proposals.length > 0,
    });

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
    proposalVotesMap,
    loading:
      loadingProposals ||
      loadingTotalVotes ||
      loadingBalance ||
      loadingUserVotes ||
      loadingProposalVotes,
    refresh,
  };
}
