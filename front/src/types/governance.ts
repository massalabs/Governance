import { Vote } from "../serializable/Vote";

export type ProposalStatus = "DISCUSSION" | "VOTING" | "ACCEPTED" | "REJECTED";

export interface CreateProposalParams {
  title: string;
  forumPostLink: string;
  summary: string;
  parameterChange?: {
    parameter: string;
    value: string;
  };
}

export interface FormattedProposal {
  id: bigint;
  title: string;
  forumPostLink: string;
  summary: string;
  parameterChange: string;
  status: ProposalStatus;
  owner: string;
  creationTimestamp: bigint;
  positiveVoteVolume: bigint;
  negativeVoteVolume: bigint;
  blankVoteVolume: bigint;
}

export interface GovernanceStats {
  totalProposals: bigint | null;
  votingProposals: bigint | null;
  totalVotes: bigint | null;
  totalMasogSupply: bigint | null;
  userMasogBalance: bigint | null;
  userVotingPower: bigint | null;
}

export interface VoteDetails {
  address: string;
  value: bigint;
  balance: bigint;
}

export interface VoteMutationParams {
  proposalId: bigint;
  voteValue: bigint;
}

export interface GovernanceData {
  proposals: FormattedProposal[];
  stats: GovernanceStats;
  userMasogBalance: bigint | null;
  userVotes: Record<string, Vote>;
  proposalVotesMap: Record<string, VoteDetails[]>;
  loading: boolean;
  refresh: () => void;
}
