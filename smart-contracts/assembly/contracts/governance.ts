import {
  Context,
  Storage,
  transferRemaining,
  setBytecode,
  balance,
  assertIsSmartContract,
  generateEvent,
} from '@massalabs/massa-as-sdk';
import { Args, boolToByte, u64ToBytes } from '@massalabs/as-types';
import {
  _onlyOwner,
  _setOwner,
  OWNER_KEY,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
import {
  proposalKey,
  UPDATE_PROPOSAL_COUNTER_TAG,
  votingStatus,
} from './governance-internals/keys';
import { MASOG_KEY } from './rolls-oracle';
import { Proposal } from './serializable/proposal';
import { Vote } from './serializable/vote';
import {
  _refresh,
  _submitProposal,
  _vote,
  _deleteProposal,
  _autoRefreshCall,
  _checkLastAutoRefresh as _ensureAutoRefresh,
  AUTO_REFRESH_STATUS_KEY,
} from './governance-internals';

/**
 * Initializes the smart contract and sets the deployer as the owner.
 */
export function constructor(_: StaticArray<u8>): void {
  if (!Context.isDeployingContract()) return;

  _setOwner(Context.caller().toString());

  Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(0));

  transferRemaining(Context.transferredCoins());
}

/**
 * Sets the MASOG contract address (owner-only).
 * @param binaryArgs - Serialized MASOG contract address.
 */
export function setMasOgContract(bin: StaticArray<u8>): void {
  _onlyOwner();
  const oracleAddr = new Args(bin)
    .nextString()
    .expect('Masog contract should be provided');

  assertIsSmartContract(oracleAddr);
  Storage.set(MASOG_KEY, oracleAddr);
}

/**
 * Submits a new update proposal, burning 1000 MASOG.
 * @param binaryArgs - Serialized arguments: forum_post_link, title, summary, parameter_change.
 */
export function submitUpdateProposal(binaryArgs: StaticArray<u8>): void {
  const initialBalance = balance();
  const args = new Args(binaryArgs);
  const proposal = args
    .nextSerializable<Proposal>()
    .expect('You need a proposal');

  // This is to check if the asc is still running, if not, we re run it
  _ensureAutoRefresh();

  _submitProposal(proposal);

  transferRemaining(initialBalance);
}

/**
 * Refreshes proposal statuses in batches.
 * @param binaryArgs - Serialized arguments: startId (u64), maxProposals (u32).
 */
export function refresh(_: StaticArray<u8>): void {
  const initialBalance = balance();
  _refresh();
  transferRemaining(initialBalance);
}

/**
 * Casts a vote on a proposal.
 * @param binaryArgs - Serialized arguments: proposalId (u64), vote (i32).
 */
export function vote(binaryArgs: StaticArray<u8>): void {
  const initialBalance = balance();

  const args = new Args(binaryArgs);
  const vote = args.nextSerializable<Vote>().expect('Vote is required');

  _ensureAutoRefresh();

  _vote(vote);

  transferRemaining(initialBalance);
}

/**
 * Upgrade the smart contract bytecode
 */
export function upgradeSC(bytecode: StaticArray<u8>): void {
  _onlyOwner();
  const initialBalance = balance();
  setBytecode(bytecode);
  transferRemaining(initialBalance);
}

/**
 * Deletes a proposal and all its associated data (admin-only).
 * This is a temporary function to help clean up illegal or spam content.
 * @param binaryArgs - Serialized proposal ID (u64).
 */
export function deleteProposal(binaryArgs: StaticArray<u8>): void {
  onlyAllowedAddresses();

  const initialBalance = balance();

  const args = new Args(binaryArgs);
  const proposalId = args.nextU64().expect('Proposal ID is required');

  _deleteProposal(proposalId);

  transferRemaining(initialBalance);
}

/**
 * Runs the auto refresh manually
 */
export function runAutoRefresh(): void {
  assert(
    Context.caller() === Context.callee() ||
    Context.caller().toString() === Storage.get(OWNER_KEY),
    'Caller is not the callee',
  );

  _autoRefreshCall();

  generateEvent(
    `[Refetch called] from async message at ${Context.timestamp().toString()}`,
  );
}

/**
 * Allow the owner ot allow or stop the auto refresh
 * @param binaryArgs - Serialized arguments: stop (bool).
 */
export function manageAutoRefresh(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  const args = new Args(binaryArgs);
  const stop = args.nextBool().expect('Boolean is required');

  Storage.set(AUTO_REFRESH_STATUS_KEY, boolToByte(stop));
}

/* -------------------------------------------------------------------------- */
/*                         TEMP FUNCTIONS TO REMOVE                           */
/* -------------------------------------------------------------------------- */

// TODO: remove this
const allowedAddresses = [
  'AU1qTGByMtnFjzU47fQG6SjAj45o5icS3aonzhj1JD1PnKa1hQ5',
  'AU12FUbb8snr7qTEzSdTVH8tbmEouHydQTUAKDXY9LDwkdYMNBVGF',
];

// TODO: remove this function
export function nextStatus(binaryArgs: StaticArray<u8>): void {
  onlyAllowedAddresses();
  // Update the status of a proposal to next status
  const args = new Args(binaryArgs);
  const proposalId = args.nextU64().expect('Proposal ID is required');

  // get Proposal
  assert(Storage.has(proposalKey(proposalId)), 'Proposal does not exist');
  const proposal = Proposal.getById(proposalId);
  proposal.setStatus(votingStatus).save();
}
// TODO: remove this function
function onlyAllowedAddresses(): void {
  assert(Storage.has(OWNER_KEY), 'Owner is not set');
  const owner = Storage.get(OWNER_KEY);

  const addresses = allowedAddresses;
  addresses.push(owner);

  assert(
    addresses.includes(Context.caller().toString()),
    'Caller is not allowed to call this function',
  );
}

/* -------------------------------------------------------------------------- */
/*                               END TEMP FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

export {
  setOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
