import { create } from "zustand";
import { Account } from "@massalabs/massa-web3";
import {
  Proposal,
  Vote,
  GovernanceStats,
  ProposalFilters,
  ProposalSort,
} from "../types/governance";
import { GovernanceService } from "../services/governance";

interface GovernanceState {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  account: Account | null;
  votingPower: bigint;
  stats: GovernanceStats;
  governanceService: GovernanceService;

  // Actions
  connect: (account: Account) => Promise<void>;
  disconnect: () => void;
  refreshProposals: () => Promise<void>;
  createProposal: (params: any) => Promise<bigint>;
  vote: (
    proposalId: bigint,
    vote: "POSITIVE" | "NEGATIVE" | "BLANK",
    comment?: string
  ) => Promise<void>;
  getVote: (proposalId: bigint, voter: string) => Promise<Vote | null>;
  getProposals: (
    filters?: ProposalFilters,
    sort?: ProposalSort
  ) => Promise<Proposal[]>;
  getProposal: (id: bigint) => Promise<Proposal | null>;
}

const governanceService = new GovernanceService();

export const useGovernanceStore = create<GovernanceState>((set, get) => ({
  proposals: [],
  loading: false,
  error: null,
  account: null,
  votingPower: BigInt(0),
  stats: {
    totalProposals: BigInt(0),
    activeProposals: BigInt(0),
    totalVotes: BigInt(0),
    totalMasogSupply: BigInt(0),
    userMasogBalance: BigInt(0),
    userVotingPower: BigInt(0),
  },
  governanceService,

  connect: async (account: Account) => {
    try {
      set({ loading: true, error: null });
      await governanceService.connect(account);
      set({ account });
      await get().refreshProposals();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  disconnect: () => {
    set({
      account: null,
      proposals: [],
      votingPower: BigInt(0),
    });
  },

  refreshProposals: async () => {
    try {
      set({ loading: true, error: null });
      const proposals = await governanceService.getProposals();
      set({ proposals });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createProposal: async (params) => {
    try {
      set({ loading: true, error: null });
      const proposalId = await governanceService.createProposal(params);
      await get().refreshProposals();
      return proposalId;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  vote: async (proposalId, vote, comment) => {
    try {
      set({ loading: true, error: null });
      await governanceService.vote(proposalId, vote, comment);
      await get().refreshProposals();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getVote: async (proposalId, voter) => {
    try {
      return await governanceService.getVote(proposalId, voter);
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  getProposals: async (filters, sort) => {
    try {
      set({ loading: true, error: null });
      const proposals = await governanceService.getProposals(filters, sort);
      set({ proposals });
      return proposals;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getProposal: async (id) => {
    try {
      return await governanceService.getProposal(id);
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },
}));
