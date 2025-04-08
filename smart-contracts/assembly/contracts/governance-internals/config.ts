import { stringToBytes } from "@massalabs/as-types";
// Mainnet config
// export const MIN_PROPOSAL_MAS_AMOUNT = u64(1000_000_000_000);
// export const MIN_PROPOSAL_MASOG_AMOUNT = u64(1000);
// export const MIN_VOTE_MASOG_AMOUNT = u64(1);
// export const DISCUSSION_PERIOD = u64(3 * 7 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds
// export const VOTING_PERIOD = u64(4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks in milliseconds


// Beta config
export const MIN_PROPOSAL_MAS_AMOUNT = u64(100_000_000_000); // 100 MAS
export const MIN_PROPOSAL_MASOG_AMOUNT = u64(1000); // 1000 MASOG
export const MIN_VOTE_MASOG_AMOUNT = u64(1); // 1 MASOG
export const DISCUSSION_PERIOD = u64(3 * 60 * 60 * 1000); // 3 hours
export const VOTING_PERIOD = u64(3 * 60 * 60 * 1000); // 3 hours
export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = u64(1);

// Test config
// export const MIN_PROPOSAL_MAS_AMOUNT = u64(1000);
// export const MIN_PROPOSAL_MASOG_AMOUNT = u64(1000);
// export const MIN_VOTE_MASOG_AMOUNT = u64(1);
// export const DISCUSSION_PERIOD = u64(5 * 60 * 1000); // 5 min
// export const VOTING_PERIOD = u64(5 * 60 * 1000); // 5 min
// export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = u64(1);


// ASC
export const AUTO_REFRESH_STATUS_KEY = stringToBytes('auto_refresh');
export const START_REFETCH_PERIOD = 20;
export const LIMIT_REFETCH_PERIOD = 40;
export const ASC_START_PERIOD = stringToBytes('ASC_START_PERIOD');
export const ASC_END_PERIOD = stringToBytes('ASC_END_PERIOD');

export const MAX_ASYNC_CALL_GAS = 1_000_000_000;
export const MAX_ASYNC_CALL_FEE = 1_000;