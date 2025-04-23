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
  adminData: () => [...governanceKeys.all, "adminData"],
  balance: () => [...governanceKeys.all, "balance"],
  totalVotes: () => [...governanceKeys.all, "totalVotes"],

  masog: {
    all: ["masog"],
    totalSupply: () => [...governanceKeys.masog.all, "totalSupply"],
  },
};
