/**
 * governanceKeys.ts
 * 
 * This file defines a centralized structure for React Query cache keys used throughout the application.
 * Using a centralized key structure helps with:
 * 1. Consistency in cache invalidation
 * 2. Avoiding typos in key strings
 * 3. Making it easier to refactor when query structures change
 * 4. Providing type safety for query keys
 */

export const governanceKeys = {
  /**
   * Base key for all governance-related queries
   * Used for invalidating all governance data at once
   */
  all: ["governance"],

  /**
   * Key for fetching all proposals
   * Used in useProposals.ts
   */
  proposals: () => [...governanceKeys.all, "proposals"],

  /**
   * Key for governance statistics
   * Used in useGovernanceData.ts
   */
  stats: () => [...governanceKeys.all, "stats"],

  /**
   * Key for user's MASOG token balance
   * Used in useUserBalance.ts
   */
  userBalance: () => [...governanceKeys.all, "userBalance"],

  /**
   * Key for user's votes on proposals
   * Used in useUserVotes.ts
   */
  userVotes: () => [...governanceKeys.all, "userVotes"],

  /**
   * Key for votes on a specific proposal
   * @param proposalId - The ID of the proposal to get votes for
   * Used in useProposalVotes.ts
   */
  proposalVotes: (proposalId: bigint) => [
    ...governanceKeys.all,
    "proposalVotes",
    proposalId.toString(),
  ],

  /**
   * Key for all proposal votes
   * Used in useProposalVotes.ts
   */
  allProposalVotes: () => [...governanceKeys.all, "allProposalVotes"],

  /**
   * Key for admin data (contract balances, events)
   * Used in useAdminData.ts and useManageAutoRefreshMutation.ts
   */
  adminData: () => [...governanceKeys.all, "adminData"],

  /**
   * Key for user's MAS balance
   * Used in useBalanceRefresh.ts
   */
  balance: () => [...governanceKeys.all, "balance"],

  /**
   * Key for total votes across all proposals
   * Used in useGovernanceData.ts
   */
  totalVotes: () => [...governanceKeys.all, "totalVotes"],

  /**
   * Nested structure for MASOG token related queries
   */
  masog: {
    /**
     * Base key for all MASOG-related queries
     */
    all: ["masog"],

    /**
     * Key for MASOG total supply
     * Used in useMasogData.ts
     */
    totalSupply: () => [...governanceKeys.masog.all, "totalSupply"],
  },
};
