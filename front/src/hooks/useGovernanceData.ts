import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  useAccountStore,
  useWriteSmartContract,
} from "@massalabs/react-ui-kit";
import { useContractStore } from "../store/useContractStore";
import { bytesToStr, Args, Mas, strToBytes } from "@massalabs/massa-web3";
import {
  FormattedProposal,
  GovernanceStats,
  ProposalStatus,
} from "../types/governance";
import { Vote } from "../serializable/Vote";
import { Proposal } from "../serializable/Proposal";
import { useMasogTotalSupply } from "./useMasogData";
// import { mockProposals } from "../mocks/proposals";
import { useCallback } from "react";

// Query keys
export const governanceKeys = {
  all: ["governance"],
  proposals: () => [...governanceKeys.all, "proposals"],
  stats: () => [...governanceKeys.all, "stats"],
  userBalance: () => [...governanceKeys.all, "userBalance"],
  userVotes: () => [...governanceKeys.all, "userVotes"],
  proposalVotes: (proposalId: bigint) => [
    ...governanceKeys.all,
    "proposalVotes",
    proposalId.toString(),
  ],
};

// Utility functions
const formatProposal = (p: Proposal): FormattedProposal => ({
  id: p.id,
  title: bytesToStr(p.title),
  forumPostLink: bytesToStr(p.forumPostLink),
  summary: bytesToStr(p.summary),
  parameterChange: bytesToStr(p.parameterChange),
  status: bytesToStr(p.status) as ProposalStatus,
  owner: bytesToStr(p.owner),
  creationTimestamp: p.creationTimestamp,
  positiveVoteVolume: p.positiveVoteVolume,
  negativeVoteVolume: p.negativeVoteVolume,
  blankVoteVolume: p.blankVoteVolume,
});

const calculateStats = (
  proposals: FormattedProposal[],
  totalMasogSupply: bigint | null,
  userBalance: bigint | null = null,
  totalVotes: bigint | null = null
): GovernanceStats => ({
  totalProposals: proposals ? BigInt(proposals.length) : null,
  votingProposals: proposals
    ? BigInt(
        proposals.filter((p) => p.status.toUpperCase() === "VOTING").length
      )
    : null,
  totalVotes: totalVotes,
  totalMasogSupply: totalMasogSupply,
  userMasogBalance: userBalance,
  userVotingPower: userBalance, // Same as balance for now
});

// Individual hooks
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
    refetchInterval: 60000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governance?.public,
    staleTime: 30000,
  });
};

export const useUserBalance = () => {
  const { masOg } = useContractStore();
  const { connectedAccount } = useAccountStore();

  return useQuery({
    queryKey: governanceKeys.userBalance(),
    queryFn: async () => {
      if (!masOg?.public || !connectedAccount) {
        console.error("MasOg contract not initialized or no account connected");
        return null;
      }

      try {
        const balance = await masOg.public.balanceOf(connectedAccount.address);
        console.log("Fetched MASOG balance:", balance.toString());
        return balance;
      } catch (error) {
        console.error("[Error] Error fetching MASOG balance:", error);
        throw error;
      }
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!masOg?.public && !!connectedAccount,
    staleTime: 15000,
  });
};

export const useUserVotes = (proposals: FormattedProposal[]) => {
  const { governance } = useContractStore();
  const { connectedAccount } = useAccountStore();

  return useQuery({
    queryKey: governanceKeys.userVotes(),
    queryFn: async () => {
      if (!governance?.public || !connectedAccount || !proposals.length) {
        throw new Error("Missing dependencies for fetching votes");
      }

      const proposalIds = proposals.map((p) => p.id);
      const votes = await governance.public.getUserVotes(
        connectedAccount.address,
        proposalIds
      );

      const votesMap: Record<string, Vote> = {};
      votes.forEach((vote) => {
        votesMap[vote.id.toString()] = new Vote(
          vote.id,
          vote.value,
          new Uint8Array()
        );
      });

      return votesMap;
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governance?.public && !!connectedAccount && proposals.length > 0,
    staleTime: 15000,
  });
};

export const useVoteMutation = () => {
  const { governance } = useContractStore();
  const { connectedAccount } = useAccountStore();
  const { callSmartContract } = useWriteSmartContract(connectedAccount!);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      proposalId,
      voteValue,
      comment,
    }: VoteMutationParams) => {
      if (!governance?.private || !connectedAccount) {
        throw new Error("Governance contract not initialized or no account");
      }

      console.log("[Debug] Creating vote with:", {
        proposalId: proposalId.toString(),
        voteValue: voteValue.toString(),
        comment,
      });

      const commentBytes = strToBytes(comment);
      console.log("[Debug] Comment bytes:", commentBytes);

      const vote = new Vote(proposalId, voteValue, commentBytes);
      console.log("[Debug] Created vote object:", vote);

      await callSmartContract(
        "vote",
        governance.private.address,
        new Args().addSerializable(vote).serialize(),
        {
          success: "Vote submitted successfully!",
          pending: "Submitting vote...",
          error: "Failed to submit vote",
        },
        Mas.fromString("1")
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: governanceKeys.all });
    },
  });
};

// Add new hook for getting proposal votes
export const useProposalVotes = (proposalId: bigint) => {
  const { governance } = useContractStore();

  return useQuery({
    queryKey: governanceKeys.proposalVotes(proposalId),
    queryFn: async () => {
      if (!governance?.public) {
        throw new Error("Governance contract not initialized");
      }

      try {
        return await governance.public.getVotes(proposalId);
      } catch (error) {
        console.error("[Error] Error fetching proposal votes:", error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: 1000,
    enabled: !!governance?.public,
  });
};

// Add new interface for vote details
interface VoteDetails {
  value: bigint;
  address: string;
  comment: string;
}

// Update the return type of useGovernanceData
interface GovernanceData {
  proposals: FormattedProposal[];
  stats: GovernanceStats;
  userMasogBalance: bigint | null;
  userVotes: Record<string, Vote>;
  proposalVotesMap: Record<string, VoteDetails[]>;
  loading: boolean;
  refresh: () => void;
}

export function useGovernanceData(): GovernanceData {
  const { governance } = useContractStore();
  const queryClient = useQueryClient();
  const { connectedAccount } = useAccountStore();

  // Fetch proposals
  const { data: proposals = [], isLoading: loadingProposals } = useQuery({
    queryKey: governanceKeys.proposals(),
    queryFn: async () => {
      if (!governance?.public) {
        throw new Error("Governance contract not initialized");
      }

      try {
        const proposals = await governance.public.getProposals();
        return proposals.map(formatProposal);
      } catch (error) {
        console.error("[Error] Error fetching proposals:", error);
        throw error;
      }
    },
    refetchInterval: 60000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governance?.public,
    staleTime: 30000,
  });

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

  // Fetch user's MASOG balance using the existing hook
  const { data: userMasogBalance = null, isLoading: loadingBalance } =
    useUserBalance();

  // Fetch user's votes
  const { data: userVotes = {}, isLoading: loadingUserVotes } =
    useUserVotes(proposals);

  // Fetch all proposal votes with details
  const { data: proposalVotesMap = {}, isLoading: loadingProposalVotes } =
    useQuery({
      queryKey: [...governanceKeys.all, "allProposalVotes"],
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

interface VoteMutationParams {
  proposalId: bigint;
  voteValue: bigint;
  comment: string;
}
