import { Mas, NetworkName, U64 } from "@massalabs/massa-web3";

export const isMainnet = false;
export const networkName = isMainnet ? NetworkName.Mainnet : NetworkName.Buildnet;
export const contracts = {

  [NetworkName.Mainnet]: {
    oracle: 'AS12VsDbbQENnxiXr42bUrWd8SYStnxR8e191dqRCPmWD5wRxJ8kc',
    masOg: 'AS12cwq9XhAKjEyfkmVMjgtrGQVNtEuwTwpef2dvUZqNRjpBdxaQs',
    governance: 'AS1imUmvMtzyJEuirpxtHwLXHYiJs6BQj7jZPNKD7peHYMhZWu4m',
  },
  [NetworkName.Buildnet]: {
    oracle: 'AS1SxFbBMQ76HX5R5m2C2DdeN27nwnhBvKaBp9aW9HEYmD3YBvpj',
    masOg: 'AS1XFQaiw9wrHxizvrLKywKXxtyM9eHmmD2mKzvHXUqB2FCTNQpL',
    governance: 'AS12ijbcmb45T7YtxpgzZKFsW62DXX1rTvTDK6aTLa58g6Qu1u5Tm',
  },
};

export function getContracts() {
  return isMainnet
    ? contracts[NetworkName.Mainnet]
    : contracts[NetworkName.Buildnet];
}

// Admin addresses that have access to the admin page
export const ADMIN_ADDRESSES = [
  'AU12hdvxeNgEUmfpktdzRa9VNfNZizGnhkjRkjRXA2ue2DnRpJuPZ',
  'AU12uBCaT1baa7cFmdfG8yAzFpHpyhUyvxPxWzAEfaC94e9CLCmPK',
  'AU12FUbb8snr7qTEzSdTVH8tbmEouHydQTUAKDXY9LDwkdYMNBVGF'
];

// Mainnet config
export const MIN_PROPOSAL_MAS_AMOUNT = Mas.fromMas(1000n);
export const MIN_PROPOSAL_MASOG_AMOUNT = U64.fromNumber(1000);
export const MIN_VOTE_MASOG_AMOUNT = U64.fromNumber(1);
export const DISCUSSION_PERIOD = U64.fromNumber(2 * 7 * 24 * 60 * 60 * 1000); // 2 weeks in milliseconds
export const VOTING_PERIOD = U64.fromNumber(1 * 7 * 24 * 60 * 60 * 1000); // 1 weeks in milliseconds
export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = 50

// Testing config
// export const DISCUSSION_PERIOD = U64.fromNumber(5 * 60 * 1000);
// export const VOTING_PERIOD = U64.fromNumber(5 * 60 * 1000);
// export const TOTAL_SUPPLY_PERCENTAGE_FOR_ACCEPTANCE = 1;
// export const MIN_PROPOSAL_MAS_AMOUNT = U64.fromNumber(1);
// export const MIN_PROPOSAL_MASOG_AMOUNT = U64.fromNumber(1);
// export const MIN_VOTE_MASOG_AMOUNT = U64.fromNumber(1);
// Maximum size in bytes for parameter change data
// Proposal size limit
export const MAX_PARAMETER_CHANGE_SIZE = 500;

export enum ProposalStatus {
  DISCUSSION = "DISCUSSION",
  VOTING = "VOTING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

// Available governance parameters that can be modified
export const AVAILABLE_GOVERNANCE_PARAMETERS = {
  "Consensus": [
    {
      id: "ROLL_PRICE",
      name: "Roll Price",
      description: "The price of a Roll, in MAS",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "BLOCK_REWARD",
      name: "Block Reward",
      description: "The max number of MAS created as reward for block and endorsement production",
      type: "number",
      min: 0,
      step: 0.01
    },
    {
      id: "POS_MISS_RATE_DEACTIVATION_THRESHOLD",
      name: "POS Miss Rate Deactivation Threshold",
      description: "A staker's roll will auto-sell if they miss more than the given threshold of selected block to produce during a given cycle",
      type: "number",
      min: 0,
      max: 100,
      step: 1
    },
    {
      id: "T0",
      name: "T0",
      description: "Time, in milliseconds, between two periods in the same thread",
      type: "number",
      min: 0,
      step: 1000
    },
    {
      id: "PERIODS_PER_CYCLE",
      name: "Periods Per Cycle",
      description: "The number of periods in a cycle",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "ENDORSEMENT_COUNT",
      name: "Endorsement Count",
      description: "The max number of endorsements per block",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "ROLL_COUNT_TO_SLASH_ON_DENUNCIATION",
      name: "Roll Count to Slash on Denunciation",
      description: "Number of roll to remove per denunciation",
      type: "number",
      min: 0,
      step: 1
    }
  ],

  "Execution": [
    {
      id: "LEDGER_COST_PER_BYTE",
      name: "Ledger Cost Per Byte",
      description: "The cost, in MAS, to store 1 byte in the ledger",
      type: "number",
      min: 0,
      step: 0.0001
    },
    {
      id: "LEDGER_ENTRY_BASE_COST",
      name: "Ledger Entry Base Cost",
      description: "The cost, in MAS, to create a new address in the ledger",
      type: "number",
      min: 0,
      step: 0.001
    },
    {
      id: "MAX_ASYNC_POOL_LENGTH",
      name: "Max Async Pool Length",
      description: "Maximum capacity of the asynchronous messages pool",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_DATASTORE_KEY_LENGTH",
      name: "Max Datastore Key Length",
      description: "Maximum length of a datastore key, in bytes",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_DATASTORE_VALUE_LENGTH",
      name: "Max Datastore Value Length",
      description: "Maximum length of a datastore value, in bytes",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_BYTECODE_LENGTH",
      name: "Max Bytecode Length",
      description: "Maximum length of the bytecode of an address, in bytes",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_PARAMETERS_SIZE",
      name: "Max Parameters Size",
      description: "Maximum size of parameters in call SC, in bytes",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_OPERATIONS_PER_BLOCK",
      name: "Max Operations Per Block",
      description: "The max number of operations per block",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_BLOCK_SIZE",
      name: "Max Block Size",
      description: "The max size of a block, in bytes",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_GAS_PER_BLOCK",
      name: "Max Gas Per Block",
      description: "Maximum of GAS allowed for a block",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_ASYNC_GAS",
      name: "Max Async Gas",
      description: "Maximum of GAS allowed for asynchronous messages execution on one slot",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_EVENT_DATA_SIZE",
      name: "Max Event Data Size",
      description: "Maximum size, in bytes, of events emitted",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_EVENT_PER_OPERATION",
      name: "Max Event Per Operation",
      description: "Maximum event number that can be emitted for an operation",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_RECURSIVE_CALLS_DEPTH",
      name: "Max Recursive Calls Depth",
      description: "Maximum number of recursion for calls",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "DEFERRED_CALL_MAX_FUTURE_SLOTS",
      name: "Deferred Call Max Future Slots",
      description: "Maximum size of deferred call future slots",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "DEFERRED_CALL_MAX_ASYNC_GAS",
      name: "Deferred Call Max Async Gas",
      description: "Maximum gas for deferred call",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "DEFERRED_CALL_MIN_GAS_COST",
      name: "Deferred Call Min Gas Cost",
      description: "Deferred call min gas cost",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "DEFERRED_CALL_CST_GAS_COST",
      name: "Deferred Call Constant Gas Cost",
      description: "Deferred call call gas cost",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_RUNTIME_MODULE_DEFINED_FUNCTIONS",
      name: "Max Runtime Module Defined Functions",
      description: "Maximum number of function defined in a smart contract",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_RUNTIME_MODULE_FUNCTION_ARGS",
      name: "Max Runtime Module Function Args",
      description: "Maximum number of arguments to a function",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_RUNTIME_MODULE_FUNCTION_RETURN_VALUES",
      name: "Max Runtime Module Function Return Values",
      description: "Maximum number of value a function can return",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_RUNTIME_MODULE_FUNCTION_NAME_LEN",
      name: "Max Runtime Module Function Name Length",
      description: "Maximum length for the name of a function defined in a smart contract",
      type: "number",
      min: 0,
      step: 1
    },
    {
      id: "MAX_RUNTIME_MODULE_FUNCTION_IMPORTS",
      name: "Max Runtime Module Function Imports",
      description: "Maximum number of functions a module can import",
      type: "number",
      min: 0,
      step: 1
    }
  ],
};
