export enum ProposalStatus {
  ACTIVE = "ACTIVE",
  EXECUTED = "EXECUTED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export interface CreateProposalParams {
  forumPostLink: string;
  title: string;
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
  status: string;
  owner: string;
  creationTimestamp: bigint;
  positiveVoteVolume: bigint;
  negativeVoteVolume: bigint;
  blankVoteVolume: bigint;
}

export interface Proposal {
  id: bigint;
  creator: string;
  forumPostLink: string;
  title: string;
  summary: string;
  parameterChange?: {
    parameter: string;
    value: string;
  };
  startTime: bigint;
  endTime: bigint;
  positiveVotes: bigint;
  negativeVotes: bigint;
  blankVotes: bigint;
  status: ProposalStatus;
}

export interface Vote {
  proposalId: bigint;
  voter: string;
  vote: "POSITIVE" | "NEGATIVE" | "BLANK";
  comment?: string;
  timestamp: bigint;
}

export interface ProposalFilters {
  status?: "ACTIVE" | "EXECUTED" | "EXPIRED" | "CANCELLED";
  creator?: string;
  startTime?: bigint;
  endTime?: bigint;
}

export interface ProposalSort {
  field:
    | "id"
    | "startTime"
    | "endTime"
    | "positiveVotes"
    | "negativeVotes"
    | "blankVotes";
  direction: "asc" | "desc";
}

export interface GovernanceStats {
  totalProposals: bigint;
  votingProposals: bigint;
  totalVotes: bigint;
  totalMasogSupply: bigint;
  userMasogBalance: bigint;
  userVotingPower: bigint;
}
