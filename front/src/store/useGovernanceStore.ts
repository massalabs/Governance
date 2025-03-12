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
  fetchProposals: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchUserBalance: () => Promise<void>;
  fetchUserVotes: () => Promise<void>;
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

  fetchProposals: async () => {
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
      // Transform proposals to include readable status and format numbers
      const formattedProposals: FormattedProposal[] = fetchedProposals.map(
        (p) => ({
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

      // Sort by ID in descending order (newest first)
      formattedProposals.sort((a, b) => Number(b.id - a.id));

      set({
        proposals: formattedProposals,
        lastProposalsFetch: now,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch proposals";
      set({ error: errorMessage });
      console.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async (force = false) => {
    const state = get();
    const now = Date.now();

    // If we have data and it's not stale, and we're not forcing a refresh, return early
    if (
      !force &&
      state.lastStatsFetch &&
      now - state.lastStatsFetch < CACHE_DURATION
    ) {
      return;
    }

    const { governance } = useContractStore.getState();
    if (!governance) return;

    try {
      set({ loading: true, error: null });

      // Get all proposals to calculate active ones and total votes
      const proposals = await governance.public.getProposals();
      const totalProposals = BigInt(proposals.length);
      const votingProposals = proposals.filter(
        (p) => bytesToStr(p.status) === "VOTING"
      ).length;

      const discussionProposals = proposals.filter(
        (p) => bytesToStr(p.status) === "DISCUSSION"
      ).length;

      // Calculate total votes
      // TODO: Get total votes from the contract
      const totalVotes = proposals.reduce(
        (acc, p) =>
          acc + p.positiveVoteVolume + p.negativeVoteVolume + p.blankVoteVolume,
        0n
      );

      set({
        stats: {
          totalProposals,
          votingProposals: BigInt(votingProposals),
          discussionProposals: BigInt(discussionProposals),
          totalVotes,
        },
        lastStatsFetch: now,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch governance stats";
      set({ error: errorMessage });
      console.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchUserBalance: async (force = false) => {
    const state = get();
    const now = Date.now();

    // If we have data and it's not stale, and we're not forcing a refresh, return early
    if (
      !force &&
      state.lastBalanceFetch &&
      now - state.lastBalanceFetch < BALANCE_CACHE_DURATION
    ) {
      return;
    }

    const { masOg } = useContractStore.getState();
    const { connectedAccount } = useAccountStore.getState();
    if (!connectedAccount || !masOg) return;

    try {
      set({ loading: true, error: null });
      const userMasogBalance = await masOg.public.balanceOf(
        connectedAccount.address
      );
      set({
        userMasogBalance,
        userVotingPower: userMasogBalance, // For now, voting power is equal to MASOG balance
        lastBalanceFetch: now,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user balance";
      set({ error: errorMessage });
      console.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchUserVotes: async () => {
    const now = Date.now();
    const lastFetch = get().lastVotesFetch;

    if (lastFetch && now - lastFetch < CACHE_DURATION) {
      return;
    }

    const { governance } = useContractStore.getState();
    const { connectedAccount } = useAccountStore.getState();
    if (!governance || !connectedAccount) return;
    try {
      // Get all proposal IDs from the current proposals
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

      console.log(votesMap);

      set({
        userVotes: votesMap,
        lastVotesFetch: now,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch user votes";
      set({ error: errorMessage });
      console.error(errorMessage);
    }
  },

  refresh: async () => {
    await Promise.all([
      get().fetchProposals(),
      get().fetchStats(),
      get().fetchUserBalance(),
      get().fetchUserVotes(),
    ]);
  },
}));

// Subscribe to account changes
useAccountStore.subscribe((state) => {
  const connectedAccount = state.connectedAccount;
  if (connectedAccount) {
    useGovernanceStore.getState().fetchUserBalance();
    useGovernanceStore.getState().fetchUserVotes();
  } else {
    // Reset user-related data when account is disconnected
    useGovernanceStore.setState({
      userMasogBalance: 0n,
      userVotingPower: 0n,
      userVotes: {}, // Clear votes when disconnected
      lastVotesFetch: null,
    });
  }
});
