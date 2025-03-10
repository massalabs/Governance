import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useGovernanceStore } from "./useGovernanceStore";
import {
  CreateProposalParams,
  Proposal as GovernanceProposal,
} from "../types/governance";

// Types
export interface UserState {
  account: string | null;
  masogBalance: bigint;
  votingPower: bigint;
  votes: {
    proposalId: string;
    vote: "yes" | "no" | "abstain";
    timestamp: number;
  }[];
  setAccount: (account: string | null) => void;
  setMasogBalance: (balance: bigint) => void;
  setVotingPower: (power: bigint) => void;
  addVote: (proposalId: string, vote: "yes" | "no" | "abstain") => void;
  hasVoted: (proposalId: string) => boolean;
  getUserVote: (proposalId: string) => "yes" | "no" | "abstain" | null;
}

export interface Proposal {
  id: string;
  title: string;
  summary: string;
  forumPostLink: string;
  creator: string;
  status: "active" | "passed" | "rejected" | "executed";
  startTime: number;
  endTime: number;
  parameterChange?: Record<string, any>;
  votes: {
    yes: bigint;
    no: bigint;
    abstain: bigint;
  };
  quorum: bigint;
}

export interface ProposalsState {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  setProposals: (proposals: Proposal[]) => void;
  addProposal: (params: CreateProposalParams) => Promise<string>;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchProposals: () => Promise<void>;
}

export interface UIState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// Create the store
export const useStore = create<UserState & ProposalsState & UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // User State
        account: null,
        masogBalance: BigInt(0),
        votingPower: BigInt(0),
        votes: [],
        setAccount: (account) => set({ account }),
        setMasogBalance: (balance) => set({ masogBalance: balance }),
        setVotingPower: (power) => set({ votingPower: power }),
        addVote: (proposalId, vote) =>
          set((state) => ({
            votes: [
              ...state.votes.filter((v) => v.proposalId !== proposalId),
              { proposalId, vote, timestamp: Date.now() },
            ],
          })),
        hasVoted: (proposalId) =>
          get().votes.some((vote) => vote.proposalId === proposalId),
        getUserVote: (proposalId) =>
          get().votes.find((vote) => vote.proposalId === proposalId)?.vote ||
          null,

        // Proposals State
        proposals: [],
        loading: false,
        error: null,
        setProposals: (proposals) => set({ proposals }),
        addProposal: async (params) => {
          const governanceStore = useGovernanceStore.getState();
          const proposalId = await governanceStore.createProposal(params);

          // Create a new proposal object with default values
          const newProposal: Proposal = {
            id: proposalId.toString(),
            title: params.title,
            summary: params.summary,
            forumPostLink: params.forumPostLink,
            creator: get().account || "",
            status: "active",
            startTime: Math.floor(Date.now() / 1000),
            endTime: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 14 days from now
            parameterChange: params.parameterChange,
            votes: {
              yes: BigInt(0),
              no: BigInt(0),
              abstain: BigInt(0),
            },
            quorum: BigInt(1000),
          };

          set((state) => ({
            proposals: [...state.proposals, newProposal],
          }));

          return proposalId.toString();
        },
        updateProposal: (id, updates) =>
          set((state) => ({
            proposals: state.proposals.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          })),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        fetchProposals: async () => {
          const governanceStore = useGovernanceStore.getState();
          set({ loading: true, error: null });
          try {
            const governanceProposals = await governanceStore.getProposals();
            // Transform governance proposals to our store format
            const proposals: Proposal[] = governanceProposals.map(
              (p: GovernanceProposal) => ({
                id: p.id.toString(),
                title: p.title,
                summary: p.summary,
                forumPostLink: p.forumPostLink,
                creator: p.creator,
                status: p.status.toLowerCase() as
                  | "active"
                  | "passed"
                  | "rejected"
                  | "executed",
                startTime: Number(p.startTime),
                endTime: Number(p.endTime),
                parameterChange: p.parameterChange,
                votes: {
                  yes: p.positiveVotes,
                  no: p.negativeVotes,
                  abstain: p.blankVotes,
                },
                quorum: BigInt(1000), // Default quorum value
              })
            );
            set({ proposals, loading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch proposals",
              loading: false,
            });
          }
        },

        // UI State
        theme: "light",
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === "light" ? "dark" : "light",
          })),
      }),
      {
        name: "governance-storage",
        partialize: (state) => ({
          theme: state.theme,
          votes: state.votes,
        }),
      }
    )
  )
);
