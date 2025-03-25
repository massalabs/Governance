import { Proposal } from "../serializable/Proposal";
import { FormattedProposal, GovernanceStats } from "../types/governance";
import { bytesToStr } from "@massalabs/massa-web3";

export const formatProposal = (p: Proposal): FormattedProposal => ({
  id: p.id,
  title: bytesToStr(p.title),
  forumPostLink: bytesToStr(p.forumPostLink),
  summary: bytesToStr(p.summary),
  parameterChange: bytesToStr(p.parameterChange),
  status: bytesToStr(p.status) as FormattedProposal["status"],
  owner: bytesToStr(p.owner),
  creationTimestamp: p.creationTimestamp,
  positiveVoteVolume: p.positiveVoteVolume,
  negativeVoteVolume: p.negativeVoteVolume,
  blankVoteVolume: p.blankVoteVolume,
});

export const calculateStats = (
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
