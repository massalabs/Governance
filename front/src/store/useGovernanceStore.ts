import { create } from "zustand";
import { useContractStore } from "./useContractStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { bytesToStr } from "@massalabs/massa-web3";

interface FormattedProposal {
  id: bigint;
  title: string;
  forumPostLink: string;
  summary: string;
  parameterChange: string;
  status: string;
  owner: string;
  creationTimestamp: bigint;
  positiveVoteVolume: bigint;
  negativeVoteVolume: bigint;
  blankVoteVolume: bigint;
}

interface GovernanceStats {
  totalProposals: bigint;
  votingProposals: bigint;
  discussionProposals: bigint;
  totalVotes: bigint;
}

interface Vote {
  proposalId: bigint;
  value: bigint;
  comment: Uint8Array;
}

interface GovernanceState {
  proposals: FormattedProposal[];
  stats: GovernanceStats;
  userMasogBalance: bigint;
  userVotingPower: bigint;
  userVotes: { [proposalId: string]: Vote };
  loading: boolean;
  error: string | null;
  lastProposalsFetch: number | null;
  lastStatsFetch: number | null;
  lastBalanceFetch: number | null;
  lastVotesFetch: number | null;
  fetchPublicData: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CACHE_DURATION = 30 * 1000; // 30 seconds in milliseconds
const BALANCE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useGovernanceStore = create<GovernanceState>((set, get) => ({
  proposals: [],
  stats: {
    totalProposals: 0n,
    votingProposals: 0n,
    discussionProposals: 0n,
    totalVotes: 0n,
  },
  userMasogBalance: 0n,
  userVotingPower: 0n,
  userVotes: {},
  loading: false,
  error: null,
  lastProposalsFetch: null,
  lastStatsFetch: null,
  lastBalanceFetch: null,
  lastVotesFetch: null,

  fetchPublicData: async () => {
    const now = Date.now();
    const lastFetch = get().lastProposalsFetch;

    if (lastFetch && now - lastFetch < CACHE_DURATION) {
      return;
    }

    const { governance } = useContractStore.getState();
    if (!governance) return;

    try {
      set({ loading: true, error: null });
      const fetchedProposals = await governance.public.getProposals();

      const formattedProposals: FormattedProposal[] = fetchedProposals.map(
        (p: any) => ({
          id: p.id,
          title: bytesToStr(p.title),
          forumPostLink: bytesToStr(p.forumPostLink),
          summary: bytesToStr(p.summary),
          parameterChange: bytesToStr(p.parameterChange),
          status: bytesToStr(p.status),
          owner: bytesToStr(p.owner),
          creationTimestamp: p.creationTimestamp,
          positiveVoteVolume: p.positiveVoteVolume,
          negativeVoteVolume: p.negativeVoteVolume,
          blankVoteVolume: p.blankVoteVolume,
        })
      );

      formattedProposals.sort((a, b) => Number(b.id - a.id));

      // Calculate stats from the proposals
      const totalProposals = BigInt(formattedProposals.length);
      const votingProposals = formattedProposals.filter(
        (p) => p.status.toUpperCase() === "VOTING"
      ).length;
      const discussionProposals = formattedProposals.filter(
        (p) => p.status.toUpperCase() === "DISCUSSION"
      ).length;
      const totalVotes = formattedProposals.reduce(
        (acc, p) =>
          acc + p.positiveVoteVolume + p.negativeVoteVolume + p.blankVoteVolume,
        0n
      );

      set({
        proposals: formattedProposals,
        stats: {
          totalProposals,
          votingProposals: BigInt(votingProposals),
          discussionProposals: BigInt(discussionProposals),
          totalVotes,
        },
        lastProposalsFetch: now,
        lastStatsFetch: now,
      });
    } catch (err) {
      console.error("Failed to fetch public data:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchUserData: async () => {
    const { connectedAccount } = useAccountStore.getState();
    const { governance, masOg } = useContractStore.getState();
    if (!connectedAccount || !governance || !masOg) return;

    try {
      // Fetch user balance
      const now = Date.now();
      const lastBalanceFetch = get().lastBalanceFetch;
      if (
        !lastBalanceFetch ||
        now - lastBalanceFetch >= BALANCE_CACHE_DURATION
      ) {
        const userMasogBalance = await masOg.public.balanceOf(
          connectedAccount.address
        );
        set({
          userMasogBalance,
          userVotingPower: userMasogBalance,
          lastBalanceFetch: now,
        });
      }

      // Fetch user votes
      const lastVotesFetch = get().lastVotesFetch;
      if (!lastVotesFetch || now - lastVotesFetch >= CACHE_DURATION) {
        const proposalIds = get().proposals.map((p) => p.id);
        const votes = await governance.public.getVotes(
          connectedAccount.address,
          proposalIds
        );

        const votesMap: { [proposalId: string]: Vote } = {};
        votes.forEach((vote) => {
          votesMap[vote.id.toString()] = {
            proposalId: vote.id,
            value: vote.value,
            comment: new Uint8Array(),
          };
        });

        set({
          userVotes: votesMap,
          lastVotesFetch: now,
        });
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  },

  refresh: async () => {
    await get().fetchPublicData();
    const { connectedAccount } = useAccountStore.getState();
    if (connectedAccount) {
      await get().fetchUserData();
    }
  },
}));

// Initialize public data when the store is created
useContractStore.subscribe((state) => {
  if (state.governance) {
    useGovernanceStore.getState().fetchPublicData();
  }
});

// Subscribe to account changes for user data
useAccountStore.subscribe((state) => {
  if (state.connectedAccount) {
    useGovernanceStore.getState().fetchUserData();
  } else {
    useGovernanceStore.setState({
      userMasogBalance: 0n,
      userVotingPower: 0n,
      userVotes: {},
      lastVotesFetch: null,
      lastBalanceFetch: null,
    });
  }
});
