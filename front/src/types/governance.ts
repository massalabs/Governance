export enum ProposalStatus {
  DISCUSSION = "DISCUSSION",
  VOTING = "VOTING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

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
  summary: string;
  forumPostLink?: string;
  owner: string;
  creationTimestamp: bigint;
  endTimestamp: bigint;
  requiredScore: bigint;
  positiveVoteVolume: bigint;
  negativeVoteVolume: bigint;
  blankVoteVolume: bigint;
  status: ProposalStatus;
  parameterChange?: any;
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
  totalProposals: bigint | null;
  votingProposals: bigint | null;
  totalVotes: bigint | null;
  totalMasogSupply: bigint | null;
  userMasogBalance: bigint | null;
  userVotingPower: bigint | null;
}
