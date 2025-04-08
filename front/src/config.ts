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

// Admin addresses that have access to the admin page
export const ADMIN_ADDRESSES = [
  "AU12FUbb8snr7qTEzSdTVH8tbmEouHydQTUAKDXY9LDwkdYMNBVGF",
];

// Mainnet config
// export const MIN_PROPOSAL_MAS_AMOUNT = U64.fromNumber(1000_000_000_000);
// export const MIN_PROPOSAL_MASOG_AMOUNT = U64.fromNumber(1000);
// export const MIN_VOTE_MASOG_AMOUNT = U64.fromNumber(1);
// export const DISCUSSION_PERIOD = u64(3 * 7 * 24 * 60 * 60 * 1000); // 3 weeks in milliseconds
// export const VOTING_PERIOD = u64(4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks in milliseconds
// export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = 50
// Beta config
export const MIN_PROPOSAL_MAS_AMOUNT = Mas.fromMas(100n);
export const MIN_PROPOSAL_MASOG_AMOUNT = U64.fromNumber(1000);
export const MIN_VOTE_MASOG_AMOUNT = U64.fromNumber(1);
export const DISCUSSION_PERIOD = U64.fromNumber(3 * 60 * 60 * 1000); // 3 hours
export const VOTING_PERIOD = U64.fromNumber(3 * 60 * 60 * 1000); // 3 hours
export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = 1;
// Test config
// export const MIN_PROPOSAL_MAS_AMOUNT = Mas.fromMas(100n);
// export const MIN_PROPOSAL_MASOG_AMOUNT = U64.fromNumber(1000);
// export const MIN_VOTE_MASOG_AMOUNT = U64.fromNumber(1);
// export const DISCUSSION_PERIOD = U64.fromNumber(5 * 60 * 1000); // 5 min
// export const VOTING_PERIOD = U64.fromNumber(5 * 60 * 1000); // 5 min

// Available governance parameters that can be modified
export const AVAILABLE_GOVERNANCE_PARAMETERS = [
  {
    id: "MIN_PROPOSAL_MAS_AMOUNT",
    name: "Minimum Proposal MAS Amount",
    description: "Minimum amount of MAS required to create a proposal",
    type: "number",
    min: 0,
    step: 1
  },
  {
    id: "MIN_PROPOSAL_MASOG_AMOUNT",
    name: "Minimum Proposal MASOG Amount",
    description: "Minimum amount of MASOG required to create a proposal",
    type: "number",
    min: 0,
    step: 1
  },
  {
    id: "MIN_VOTE_MASOG_AMOUNT",
    name: "Minimum Vote MASOG Amount",
    description: "Minimum amount of MASOG required to vote on a proposal",
    type: "number",
    min: 0,
    step: 1
  },
  {
    id: "DISCUSSION_PERIOD",
    name: "Discussion Period",
    description: "Duration of the discussion period in milliseconds",
    type: "number",
    min: 0,
    step: 1000
  },
  {
    id: "VOTING_PERIOD",
    name: "Voting Period",
    description: "Duration of the voting period in milliseconds",
    type: "number",
    min: 0,
    step: 1000
  },
  {
    id: "TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE",
    name: "Total Supply Percentage for Acceptance",
    description: "Percentage of total supply required for a proposal to be accepted",
    type: "number",
    min: 0,
    max: 100,
    step: 0.1
  },
  {
    id: "GOVERNANCE_DESCRIPTION",
    name: "Governance Description",
    description: "Description of the governance system displayed to users",
    type: "text",
    maxLength: 500
  },
];
