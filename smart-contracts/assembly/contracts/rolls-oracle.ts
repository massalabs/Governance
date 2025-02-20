import {
  Context,
  Storage,
  balance,
  generateEvent,
  setBytecode,
  transferRemaining,
} from '@massalabs/massa-as-sdk';
import { Args, u64ToBytes } from '@massalabs/as-types';
import {
  _onlyOwner,
  _setOwner,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership-internal';
import { RollEntry } from './serializable/roll-entry';
import { _deleteCycle, _feedCycle } from './oracle-internals';
import { ORACLE_LAST_RECORDED_CYCLE } from './oracle-internals/keys';

/**
 * Initializes the smart contract and sets the deployer as the owner.
 */
export function constructor(_: StaticArray<u8>): void {
  if (!Context.isDeployingContract()) return;

  _setOwner(Context.caller().toString());

  Storage.set(ORACLE_LAST_RECORDED_CYCLE, u64ToBytes(0));

  generateEvent('Oracle Contract Initialized');
  transferRemaining(Context.transferredCoins());
}

/**
 * Feed cycle data into the oracle.
 * @param binaryArgs - Serialized arguments containing the cycle number and roll data.
 */
export function feedCycle(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  const args = new Args(binaryArgs);

  const rollData = args
    .nextSerializableObjectArray<RollEntry>()
    .expect('Invalid roll data');

  const cycle = args.next<u64>().expect('Invalid cycle number');

  const isLastBatch = args.next<boolean>().expect('Invalid isLastBatch');

  const initialBalance = balance();

  _feedCycle(rollData, cycle, isLastBatch);

  transferRemaining(initialBalance);
}

/**
 * Delete a cycle from history.
 * @param binaryArgs - Serialized arguments containing the cycle number.
 */
export function deleteCycle(binaryArgs: StaticArray<u8>): void {
  _onlyOwner();
  const args = new Args(binaryArgs);
  const cycle = args.next<u64>().expect('Invalid cycle number');
  const nbToDelete = args
    .next<u32>()
    .expect('Invalid number of cycles to delete');
  const initialBalance = balance();

  _deleteCycle(cycle, nbToDelete);

  transferRemaining(initialBalance);
  generateEvent(`Cycle ${cycle} deleted successfully`);
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

export {
  setOwner,
  ownerAddress,
} from '@massalabs/sc-standards/assembly/contracts/utils/ownership';
