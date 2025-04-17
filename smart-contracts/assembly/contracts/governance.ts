import {
  Context,
  Storage,
  transferRemaining,
  setBytecode,
  balance,
  assertIsSmartContract,
  generateEvent,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import { Args, boolToByte, u64ToBytes } from '@massalabs/as-types';
import {
  _isOwner,
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
import {
  _ensureAutoRefresh,
  _autoRefreshCall,
  MAX_ASYNC_CALL_GAS_KEY,
  MAX_ASYNC_CALL_FEE_KEY,
  AUTO_REFRESH_STATUS_KEY,
  ASC_END_PERIOD
} from './governance-internals/auto-refresh';
import { ALLOWED_ADDRESSES } from './governance-internals/config';
import { ManageAutoRefresh } from './serializable/manage-auto-refresh';


/**
 * Sets the owner and the MASOG contract address
 * @param binaryArgs - Serialized MASOG contract address.
 */
export function constructor(bin: StaticArray<u8>): void {
  if (!Context.isDeployingContract()) return;

  _setOwner(Context.caller().toString());

  const masOgAddr = new Args(bin)
    .nextString()
    .expect('Oracle contract should be provided');

  assertIsSmartContract(masOgAddr);


  Storage.set(UPDATE_PROPOSAL_COUNTER_TAG, u64ToBytes(0));
  Storage.set(AUTO_REFRESH_STATUS_KEY, boolToByte(true));
  Storage.set(ASC_END_PERIOD, u64ToBytes(0));
  Storage.set(MASOG_KEY, masOgAddr);
}

/**
 * Sets the MASOG contract address (owner-only).
 * @param binaryArgs - Serialized MASOG contract address.
 */
export function setMasOgContract(bin: StaticArray<u8>): void {
  _onlyOwner();
  const masogAddr = new Args(bin)
    .nextString()
    .expect('Masog contract should be provided');

  assertIsSmartContract(masogAddr);

  Storage.set(MASOG_KEY, masogAddr);
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

  _ensureAutoRefresh(); // This is to check if the asc is still running, if not, we re run it

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
 * Function called by the ASC to run the auto refresh
 * @remarks This function is called by the contract itself
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
 * Allow the owner ot allow or stop the auto refresh
 * @param binaryArgs - Serialized arguments: stop (bool).
 * @remarks This function is used to allow or stop or allow the auto refresh
 * and set the max gas and fee for the auto refresh
 */
export function manageAutoRefresh(binaryArgs: StaticArray<u8>): void {
  onlyAllowedAddresses();
  const args = new Args(binaryArgs);
  const manageAutoRefresh = args.nextSerializable<ManageAutoRefresh>().expect('Manage auto refresh is required');

  Storage.set(AUTO_REFRESH_STATUS_KEY, boolToByte(manageAutoRefresh.stop));

  if (manageAutoRefresh.maxGas > 0) {
    Storage.set(MAX_ASYNC_CALL_GAS_KEY, u64ToBytes(manageAutoRefresh.maxGas))
  }

  if (manageAutoRefresh.maxFee > 0) {
    Storage.set(MAX_ASYNC_CALL_FEE_KEY, u64ToBytes(manageAutoRefresh.maxFee))
  }
}


/**
 * Receives coins and generates an event
 */
export function receiveCoins(): void {
  generateEvent('CoinsReceived: ' + Context.transferredCoins().toString());
}

/**
 * Allows the owner to withdraw funds from the contract balance.
 * Only the contract owner can call this function.
 * @param binaryArgs - Serialized amount to withdraw.
 * @throws If the caller is not the owner, the amount is invalid, or the contract has insufficient balance.
 */
export function withdrawCoins(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  const args = new Args(binaryArgs);
  const amount = args.next<u64>().expect('Invalid amount');
  assert(amount > 0, 'Invalid amount');
  assert(balance() >= amount, 'Contract has insufficient balance');

  transferCoins(Context.caller(), amount);
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

  // Only proposals that has been rejected can be deleted
  _deleteProposal(proposalId);

  transferRemaining(initialBalance);
}


function onlyAllowedAddresses(): void {
  assert(ALLOWED_ADDRESSES.includes(Context.caller().toString()) || _isOwner(Context.caller().toString()), 'Address is not allowed');
}

/* -------------------------------------------------------------------------- */
/*                               END TEMP FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

export {
  setOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
