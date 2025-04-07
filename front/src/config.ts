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
    governance: "AS12qAQPHf7JHvZXAFPemSxe7erCiGjX8J24sK4qQNwFLt2C5GToY",
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
// export const DISCUSSION_PERIOD = U64.fromNumber(10 * 60 * 1000); // 10 minutes
// export const VOTING_PERIOD = U64.fromNumber(10 * 60 * 1000); // 10 minutes
// export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = 50
// BETA CONFIG
export const MIN_PROPOSAL_MAS_AMOUNT = Mas.fromMas(1n);
export const MIN_PROPOSAL_MASOG_AMOUNT = U64.fromNumber(1000);
export const MIN_VOTE_MASOG_AMOUNT = U64.fromNumber(1);

export const DISCUSSION_PERIOD = U64.fromNumber(5 * 60 * 1000); // 10 minutes
export const VOTING_PERIOD = U64.fromNumber(5 * 60 * 1000); // 10 minutes

export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = 1;
