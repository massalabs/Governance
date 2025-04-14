import {
  Address,
  Context,
  Storage,
  assertIsSmartContract,
  balance,
  call,
  generateEvent,
  getKeys,
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
import {
  ORACLE_LAST_RECORDED_CYCLE,
  rollKeyPrefix,
} from './oracle-internals/keys';
import { KeyValue } from './serializable/key-value';

export const MASOG_KEY = 'MASOG_KEY';

const MAX_MINT_COST: u64 = 9_600_000;

/**
 * Initializes the smart contract and sets the deployer as the owner.
 */
export function constructor(_: StaticArray<u8>): void {
  if (!Context.isDeployingContract()) return;

  _setOwner(Context.caller().toString());

  Storage.set(ORACLE_LAST_RECORDED_CYCLE, u64ToBytes(0));

  transferRemaining(Context.transferredCoins());
}

export function migrate(bin: StaticArray<u8>): void {
  _onlyOwner();

  const initialBalance = balance();

  const keyValues = new Args(bin)
    .nextSerializableObjectArray<KeyValue>()
    .expect('Key values should be provided');

  for (let i = 0; i < keyValues.length; i++) {
    const keyValue = keyValues[i];
    Storage.set(keyValue.key, keyValue.value);
  }

  transferRemaining(initialBalance);
}

export function setMasOgAddress(bin: StaticArray<u8>): void {
  _onlyOwner();
  const oracleAddr = new Args(bin)
    .nextString()
    .expect('Masog contract should be provided');

  assertIsSmartContract(oracleAddr);
  Storage.set(MASOG_KEY, oracleAddr);
}

export function unsetMasOgAddress(_: StaticArray<u8>): void {
  _onlyOwner();
  Storage.del(MASOG_KEY);
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

  // This should not be activated before transfer to contract feature is activated on mainnet
  if (isLastBatch && Storage.has(MASOG_KEY)) {
    const nbStakers = getKeys(rollKeyPrefix(cycle)).length;
    call(
      new Address(Storage.get(MASOG_KEY)),
      'refresh',
      new Args().add(<i32>0),
      nbStakers * MAX_MINT_COST + 1_000_000_000,
    );
  }

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
