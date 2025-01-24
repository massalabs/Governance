import {
  Context,
  Storage,
  balance,
  generateEvent,
  getKeys,
  setBytecode,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import {
  Args,
  bytesToU32,
  stringToBytes,
  u32ToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import {
  _onlyOwner,
  _setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
import { RollEntry } from './roll-entry';

// Storage Tags
const RECORDED_CYCLES_TAG = stringToBytes('RECORDED_CYCLES');
export const LAST_CYCLE_TAG = stringToBytes('LAST_CYCLE');
const ROLLS_TAG = stringToBytes('ROLLS');

export function recordedCycleKey(cycle: u32): StaticArray<u8> {
  return RECORDED_CYCLES_TAG.concat(u32ToBytes(cycle));
}

export function rollKeyPrefix(cycle: u32): StaticArray<u8> {
  return ROLLS_TAG.concat(u32ToBytes(cycle));
}

export function rollKey(cycle: u32, address: string): StaticArray<u8> {
  return rollKeyPrefix(cycle).concat(stringToBytes(address));
}

export function validateAndSetCycle(cycle: u32): void {
  // TODO - Check logic of this function
  if (!Storage.has(LAST_CYCLE_TAG)) {
    Storage.set(LAST_CYCLE_TAG, u32ToBytes(cycle));
    Storage.set(recordedCycleKey(cycle), new StaticArray<u8>(0));
  }

  const lastCycle = bytesToU32(Storage.get(LAST_CYCLE_TAG));
  assert(cycle >= lastCycle, 'Cycle cannot be lower than the last cycle');
  if (cycle > lastCycle) {
    Storage.set(LAST_CYCLE_TAG, u32ToBytes(cycle));
    Storage.set(recordedCycleKey(cycle), new StaticArray<u8>(0));
  }
}

/**
 * Initializes the smart contract and sets the deployer as the owner.
 */
export function constructor(_: StaticArray<u8>): void {
  if (!Context.isDeployingContract()) return;

  _setOwner(Context.caller().toString());
  generateEvent('Oracle Contract Initialized');
}

/**
 * Feed cycle data into the oracle.
 * @param binaryArgs - Serialized arguments containing the cycle number and roll data.
 */
export function feedCycle(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  // TODO - Add a limit to no exceed the gas limit ?
  const args = new Args(binaryArgs);
  const cycle = args.next<u32>().expect('Invalid cycle number');
  validateAndSetCycle(cycle);

  const rollData = args
    .nextSerializableObjectArray<RollEntry>()
    .expect('Invalid roll data');

  for (let i = 0; i < rollData.length; i++) {
    Storage.set(
      rollKey(cycle, rollData[i].address),
      u64ToBytes(rollData[i].rolls),
    );
  }

  generateEvent(`Cycle ${cycle} data fed successfully`);
}

/**
 * Delete a cycle from history.
 * @param binaryArgs - Serialized arguments containing the cycle number.
 */
export function deleteCycle(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  const args = new Args(binaryArgs);
  const cycle = args.next<u32>().expect('Invalid cycle number');

  assert(Storage.has(recordedCycleKey(cycle)), 'Cycle not found');

  const rollKeys = getKeys(rollKeyPrefix(cycle));

  // TODO - Add a limit to no exceed the gas limit ?
  for (let i = 0; i < rollKeys.length; i++) {
    Storage.del(rollKeys[i]);
  }

  generateEvent(`Cycle ${cycle} deleted successfully`);
}

/**
 * Receive coins sent to the contract.
 */
export function receiveCoins(): void {
  generateEvent(`Coins received: ${Context.transferredCoins().toString()}`);
}

/**
 * Withdraw all coins from the contract balance to the owner's address.
 */
export function withdrawCoins(): void {
  _onlyOwner();
  const owner = Context.caller();
  const amount = balance();
  transferCoins(owner, amount);
  generateEvent(`Withdrawn ${amount.toString()} coins to owner: ${owner}`);
}

/**
 * Upgrade the DNS smart contract bytecode
 * @param args - new bytecode
 * @returns void
 */
export function upgradeSC(bytecode: StaticArray<u8>): void {
  _onlyOwner();
  setBytecode(bytecode);
}

export {
  setOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
