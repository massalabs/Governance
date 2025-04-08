import {
  Context,
  Storage,
  transferRemaining,
  setBytecode,
  balance,
  assertIsSmartContract,
} from '@massalabs/massa-as-sdk';
import { Args, boolToByte, u64ToBytes } from '@massalabs/as-types';
import {
  _onlyOwner,
  _setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
import {
  UPDATE_PROPOSAL_COUNTER_TAG,
} from './governance-internals/keys';
import { MASOG_KEY } from './rolls-oracle';
import { Proposal } from './serializable/proposal';
import { Vote } from './serializable/vote';
import {
  _refresh,
  _submitProposal,
  _vote,
  _deleteProposal,
} from './governance-internals';
import { _ensureAutoRefresh, _autoRefreshCall, MAX_ASYNC_CALL_GAS_KEY, MAX_ASYNC_CALL_FEE_KEY } from './governance-internals/auto-refresh';
import { AUTO_REFRESH_STATUS_KEY, ASC_START_PERIOD, ASC_END_PERIOD } from './governance-internals/config';

/**
 * Initializes the smart contract and sets the deployer as the owner.
 */
export function constructor(_: StaticArray<u8>): void {
  if (!Context.isDeployingContract()) return;

  _setOwner(Context.caller().toString());

  Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(0));
  Storage.set(AUTO_REFRESH_STATUS_KEY, boolToByte(true));
  Storage.set(ASC_START_PERIOD, u64ToBytes(0));
  Storage.set(ASC_END_PERIOD, u64ToBytes(0));

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


  _submitProposal(proposal);

  // This is to check if the asc is still running, if not, we re run it
  _ensureAutoRefresh();
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

  _vote(vote);

  _ensureAutoRefresh();

  transferRemaining(initialBalance);
}

/**
 * Refreshes proposal statuses in batches.
 * @param binaryArgs - Serialized arguments: startId (u64), maxProposals (u32).
 */
export function refresh(_: StaticArray<u8>): void {
  const initialBalance = balance();

  _refresh();
  _ensureAutoRefresh();

  transferRemaining(initialBalance);
}

/**
 * Run the auto refresh manually
 */
export function runAutoRefresh(): void {
  assert(Context.caller() === Context.callee(), 'Caller must be the callee');
  _refresh();
  _autoRefreshCall();
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
  onlyAllowedAddresses()

  const initialBalance = balance();

  const args = new Args(binaryArgs);
  const proposalId = args.nextU64().expect('Proposal ID is required');

  _deleteProposal(proposalId);

  transferRemaining(initialBalance);
}

/**
 * Allow the owner ot allow or stop the auto refresh
 * @param binaryArgs - Serialized arguments: stop (bool).
 * @remarks This function is used to allow or stop or allow the auto refresh
 */
export function manageAutoRefresh(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  const args = new Args(binaryArgs);
  const stop = args.nextBool().expect('Boolean is required');
  const maxGas = args.nextU64().expect('maxGas is required');
  const maxFee = args.nextU64().expect('maxFee is required');

  Storage.set(AUTO_REFRESH_STATUS_KEY, boolToByte(stop));
  if (maxGas > 0) Storage.set(MAX_ASYNC_CALL_GAS_KEY, u64ToBytes(maxGas));
  if (maxFee > 0) Storage.set(MAX_ASYNC_CALL_FEE_KEY, u64ToBytes(maxFee));
}

/* -------------------------------------------------------------------------- */
/*                         TEMP FUNCTIONS TO REMOVE                           */
/* -------------------------------------------------------------------------- */


function onlyAllowedAddresses(): void {
  const allowedAddresses = [
    'AU12FUbb8snr7qTEzSdTVH8tbmEouHydQTUAKDXY9LDwkdYMNBVGF',
    'AU1qTGByMtnFjzU47fQG6SjAj45o5icS3aonzhj1JD1PnKa1hQ5',
    'AU1wfDH3BNBiFF9Nwko6g8q5gMzHW8KUHUL2YysxkZKNZHq37AfX',
    'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq'
  ];
  assert(allowedAddresses.includes(Context.caller().toString()), 'Address is not allowed');
}

/* -------------------------------------------------------------------------- */
/*                               END TEMP FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

export {
  setOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
