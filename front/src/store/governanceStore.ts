import { create } from "zustand";
import { useContractStore } from "./contractStore";
import { useAccountStore } from "@massalabs/react-ui-kit";
import { bytesToStr } from "@massalabs/massa-web3";
import { toast } from "@massalabs/react-ui-kit";

interface RawProposal {
  id: bigint;
  title: Uint8Array;
  forumPostLink: Uint8Array;
  summary: Uint8Array;
  parameterChange: Uint8Array;
  status: Uint8Array;
  owner: Uint8Array;
  creationTimestamp: bigint;
  positiveVoteVolume: bigint;
  negativeVoteVolume: bigint;
  blankVoteVolume: bigint;
}

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
  activeProposals: bigint;
  totalVotes: bigint;
  userMasogBalance: bigint;
  userVotingPower: bigint;
}

interface GovernanceState {
  proposals: FormattedProposal[];
  stats: GovernanceStats;
  loading: boolean;
  error: string | null;
  lastProposalsFetch: number | null;
  lastStatsFetch: number | null;
  fetchProposals: (force?: boolean) => Promise<void>;
  fetchStats: (force?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

const CACHE_DURATION = 30 * 1000; // 30 seconds in milliseconds

export const useGovernanceStore = create<GovernanceState>((set, get) => ({
  proposals: [],
  stats: {
    totalProposals: 0n,
    activeProposals: 0n,
    totalVotes: 0n,
    userMasogBalance: 0n,
    userVotingPower: 0n,
  },
  loading: false,
  error: null,
  lastProposalsFetch: null,
  lastStatsFetch: null,

  fetchProposals: async (force = false) => {
    const state = get();
    const now = Date.now();

    // If we have data and it's not stale, and we're not forcing a refresh, return early
    if (
      !force &&
      state.proposals.length > 0 &&
      state.lastProposalsFetch &&
      now - state.lastProposalsFetch < CACHE_DURATION
    ) {
      return;
    }

    const { governance } = useContractStore.getState();
    if (!governance) return;

    try {
      set({ loading: true, error: null });
      const fetchedProposals = await governance.getProposals();

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
      toast.error(errorMessage);
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

    const { governance, masOg } = useContractStore.getState();
    const { connectedAccount } = useAccountStore.getState();
    if (!governance) return;

    try {
      set({ loading: true, error: null });

      // Get total proposals from counter
      const totalProposals = await governance.getCounter();

      // Get all proposals to calculate active ones and total votes
      const proposals = await governance.getProposals();
      const activeProposals = proposals.filter(
        (p) => bytesToStr(p.status) === "votingStatus"
      ).length;

      // Calculate total votes
      const totalVotes = proposals.reduce(
        (acc, p) =>
          acc + p.positiveVoteVolume + p.negativeVoteVolume + p.blankVoteVolume,
        0n
      );

      // Get user-specific stats if connected
      let userMasogBalance = 0n;
      let userVotingPower = 0n;

      if (connectedAccount && masOg) {
        userMasogBalance = await masOg.balanceOf(connectedAccount.address);
        // For now, voting power is equal to MASOG balance
        userVotingPower = userMasogBalance;
      }

      set({
        stats: {
          totalProposals,
          activeProposals: BigInt(activeProposals),
          totalVotes,
          userMasogBalance,
          userVotingPower,
        },
        lastStatsFetch: now,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch governance stats";
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    await Promise.all([get().fetchProposals(true), get().fetchStats(true)]);
  },
}));
