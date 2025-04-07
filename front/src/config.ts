import { Mas, NetworkName, U64 } from "@massalabs/massa-web3";

export const isMainnet = false;
export const networkName = isMainnet ? NetworkName.Mainnet : NetworkName.Buildnet;
export const contracts = {
  [NetworkName.Mainnet]: {
    oracle: "AS1OracleAddress",
    masOg: "XXX",
    governance: "AS1GovernanceAddress",
  },
  [NetworkName.Buildnet]: {
    masOg: "AS1RBDkKmg4DNxH4niuUZaec7rXe6qcbmZi8UeTFCBYp9zwxmBrF",
    oracle: "AS1yUyqvqoQhEw1BEm6k2P3gHz1hvr4mLy5BwCujnTdiBNjYLPAs",
    governance: "AS12k9LK17UVQGp96dPGhKiQ7xWmMihbN81DhagaCrcdgcRNHJQbE",
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}

// export const MIN_PROPOSAL_MAS_AMOUNT = U64.fromNumber(1000_000_000_000);
// export const MIN_PROPOSAL_MASOG_AMOUNT = U64.fromNumber(1000);
// export const MIN_VOTE_MASOG_AMOUNT = U64.fromNumber(1);
// export const DISCUSSION_PERIOD = u64(3 * 7 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds
// export const VOTING_PERIOD = u64(4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks in milliseconds
// export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = 50
// BETA CONFIG
export const MIN_PROPOSAL_MAS_AMOUNT = Mas.fromMas(100n);
export const MIN_PROPOSAL_MASOG_AMOUNT = U64.fromNumber(1000);
export const MIN_VOTE_MASOG_AMOUNT = U64.fromNumber(1);

export const DISCUSSION_PERIOD = U64.fromNumber(3 * 60 * 60 * 1000); // 3 hours
export const VOTING_PERIOD = U64.fromNumber(3 * 60 * 60 * 1000); // 3 hours

export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = 1;
