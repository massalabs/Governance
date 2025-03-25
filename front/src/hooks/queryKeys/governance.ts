export const governanceKeys = {
  all: ["governance"],
  proposals: () => [...governanceKeys.all, "proposals"],
  stats: () => [...governanceKeys.all, "stats"],
  userBalance: () => [...governanceKeys.all, "userBalance"],
  userVotes: () => [...governanceKeys.all, "userVotes"],
  proposalVotes: (proposalId: bigint) => [
    ...governanceKeys.all,
    "proposalVotes",
    proposalId.toString(),
  ],
  allProposalVotes: () => [...governanceKeys.all, "allProposalVotes"],
};
