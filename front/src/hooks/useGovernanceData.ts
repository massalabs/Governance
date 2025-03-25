import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContractStore } from "../store/useContractStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
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
  const { connectedAccount } = useAccountStore();

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
        if (!governance?.public || !proposals.length || !connectedAccount) {
          throw new Error("Missing dependencies for fetching proposal votes");
        }

        try {
          const votesMap: Record<string, VoteDetails[]> = {};

          // Get all votes for the user
          const userVotes = await governance.public.getUserVotes(
            connectedAccount.address,
            proposals.map((p) => p.id)
          );

          // Group votes by proposal
          for (const proposal of proposals) {
            const proposalVotes = userVotes.filter((v) => v.id === proposal.id);

            // Create vote details without comments
            const voteDetails: VoteDetails[] = proposalVotes.map((vote) => ({
              value: vote.value,
              address: connectedAccount.address,
              comment: "", // Comments are now handled separately via getComments
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
      enabled:
        !!governance?.public && !!connectedAccount && proposals.length > 0,
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
