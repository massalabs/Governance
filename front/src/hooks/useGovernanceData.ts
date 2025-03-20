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
// import { mockProposals } from "../mocks/proposals";
import { useEffect } from "react";

// Query keys
export const governanceKeys = {
  all: ["governance"],
  proposals: () => [...governanceKeys.all, "proposals"],
  stats: () => [...governanceKeys.all, "stats"],
  userBalance: () => [...governanceKeys.all, "userBalance"],
  userVotes: () => [...governanceKeys.all, "userVotes"],
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
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governance?.public,
  });
};

export const useUserBalance = () => {
  const { masOg } = useContractStore();
  const { connectedAccount } = useAccountStore();

  return useQuery({
    queryKey: governanceKeys.userBalance(),
    queryFn: async () => {
      if (!masOg?.public || !connectedAccount)
        throw new Error("MasOg contract not initialized or no account");

      return masOg.public.balanceOf(connectedAccount.address);
    },
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!masOg?.public && !!connectedAccount,
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
      const votes = await governance.public.getVotes(
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
    refetchInterval: 10000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!governance?.public && !!connectedAccount && proposals.length > 0,
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

      const vote = new Vote(proposalId, voteValue, strToBytes(comment));
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

// Main hook that combines all the data
export function useGovernanceData() {
  const { connectedAccount } = useAccountStore();
  const { masOg, governance } = useContractStore();
  const queryClient = useQueryClient();

  const { data: realProposals = [], isLoading: isLoadingProposals } =
    useProposals();
  const { data: userBalance, isLoading: isLoadingBalance } = useUserBalance();
  const { data: userVotes = {}, isLoading: isLoadingVotes } =
    useUserVotes(realProposals);

  // Get total supply for stats
  const { data: totalMasogSupply, isLoading: isLoadingSupply } = useQuery({
    queryKey: [...governanceKeys.all, "totalSupply"],
    queryFn: async () => {
      try {
        const supply = await masOg?.public?.totalSupply();

        return supply ?? null;
      } catch (error) {
        console.error("[Error] Error fetching total supply:", error);
        throw error;
      }
    },
    enabled: !!masOg?.public,
  });

  // Get total number of votes
  const { data: totalVotes, isLoading: isLoadingTotalVotes } = useQuery({
    queryKey: [...governanceKeys.all, "totalVotes"],
    queryFn: async () => {
      try {
        const votes = await governance?.public?.getTotalNbVotes();

        return votes ?? 0n;
      } catch (error) {
        console.error("[Error] Error fetching total votes:", error);
        throw error;
      }
    },
    enabled: !!governance?.public,
    initialData: 0n,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const isLoading =
    isLoadingProposals ||
    isLoadingBalance ||
    isLoadingVotes ||
    isLoadingSupply ||
    isLoadingTotalVotes;

  const stats = calculateStats(
    isLoadingProposals ? [] : realProposals,
    isLoadingSupply ? null : totalMasogSupply ?? null,
    isLoadingBalance ? null : userBalance ?? null,
    isLoadingTotalVotes ? 0n : totalVotes ?? 0n
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: governanceKeys.all });
  };

  // Add useEffect to ensure initial data fetch
  useEffect(() => {
    if (masOg?.public && connectedAccount) {
      refresh();
    }
  }, [masOg?.public, connectedAccount]);

  return {
    proposals: isLoading ? [] : realProposals,
    loading: isLoading,
    stats,
    userMasogBalance: isLoadingBalance ? null : userBalance ?? null,
    userVotingPower: isLoadingBalance ? null : userBalance ?? null,
    userVotes: isLoadingVotes ? {} : userVotes,
    connectedAccount,
    refresh,
  };
}

interface VoteMutationParams {
  proposalId: bigint;
  voteValue: bigint;
  comment: string;
}
