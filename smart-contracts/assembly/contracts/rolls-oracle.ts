import {
  Context,
  balance,
  generateEvent,
  setBytecode,
  transferCoins,
} from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import {
  _onlyOwner,
  _setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
import { RollEntry } from './serializable/roll-entry';
import { _deleteCycle, _feedCycle } from './oracle-internals';

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

  const args = new Args(binaryArgs);
  const cycle = args.next<u32>().expect('Invalid cycle number');
  const rollData = args
    .nextSerializableObjectArray<RollEntry>()
    .expect('Invalid roll data');

  _feedCycle(cycle, rollData);
}

/**
 * Delete a cycle from history.
 * @param binaryArgs - Serialized arguments containing the cycle number.
 */
export function deleteCycle(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  const args = new Args(binaryArgs);
  const cycle = args.next<u32>().expect('Invalid cycle number');
  const nbToDelete = args
    .next<i32>()
    .expect('Invalid number of cycles to delete');

  _deleteCycle(cycle, nbToDelete);

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
 * Upgrade the smart contract bytecode
 */
export function upgradeSC(bytecode: StaticArray<u8>): void {
  _onlyOwner();
  setBytecode(bytecode);
}

export {
  setOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
