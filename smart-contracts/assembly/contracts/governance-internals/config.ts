import { u256 } from "as-bignum/assembly";

// Admin
export const ALLOWED_ADDRESSES = [
    'AU12hdvxeNgEUmfpktdzRa9VNfNZizGnhkjRkjRXA2ue2DnRpJuPZ',
    'AU12uBCaT1baa7cFmdfG8yAzFpHpyhUyvxPxWzAEfaC94e9CLCmPK',
    'AU12FUbb8snr7qTEzSdTVH8tbmEouHydQTUAKDXY9LDwkdYMNBVGF'
];

// Governance config
export const MIN_PROPOSAL_MAS_AMOUNT = u64(1000_000_000_000);
export const MIN_PROPOSAL_MASOG_AMOUNT = u256.fromU64(1000);
export const MIN_VOTE_MASOG_AMOUNT = u256.fromU64(1);
export const DISCUSSION_PERIOD = u64(2 * 7 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds
export const VOTING_PERIOD = u64(1 * 7 * 24 * 60 * 60 * 1000); // 4 weeks in milliseconds
export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = u256.fromU64(50);

// Governance testing config
// export const DISCUSSION_PERIOD = u64(5 * 60 * 1000);
// export const VOTING_PERIOD = u64(5 * 60 * 1000);
// export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = u64(1);
// export const MIN_PROPOSAL_MAS_AMOUNT = u64(1);
// export const MIN_PROPOSAL_MASOG_AMOUNT = u64(1);
// export const MIN_VOTE_MASOG_AMOUNT = u64(1);

// ASC
export const START_REFETCH_PERIOD = 20;
export const LIMIT_REFETCH_PERIOD = 40;

export const MAX_ASYNC_CALL_GAS = 1_000_000_000;
export const MAX_ASYNC_CALL_FEE = 1_000;