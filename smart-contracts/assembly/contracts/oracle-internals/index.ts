import {
  u32ToBytes,
  bytesToU32,
  u64ToBytes,
  boolToByte,
} from '@massalabs/as-types';
import { getKeys, Storage } from '@massalabs/massa-as-sdk';
import { RollEntry } from '../serializable/roll-entry';
import {
  LAST_CYCLE_TAG,
  recordedCycleKey,
  rollKey,
  rollKeyPrefix,
  deletingCycleKey,
} from './keys';

/**
 * Validates the given cycle and sets it if it is valid.
 * @param cycle - The cycle to validate and set.
 */
export function validateAndSetCycle(cycle: u32): void {
  let lastCycle: u32 = 0;

  if (Storage.has(LAST_CYCLE_TAG)) {
    lastCycle = bytesToU32(Storage.get(LAST_CYCLE_TAG));
    assert(cycle >= lastCycle, 'Cycle cannot be lower than the last cycle');
    if (cycle === lastCycle) return;
  }

  Storage.set(LAST_CYCLE_TAG, u32ToBytes(cycle));
  Storage.set(recordedCycleKey(cycle), new StaticArray<u8>(0));
}

/**
 * Feeds roll data for a given cycle.
 * @param cycle - The cycle to feed roll data for.
 * @param rollData - An array of RollEntry objects containing the roll data.
 */
export function _feedCycle(cycle: u32, rollData: RollEntry[]): void {
  validateAndSetCycle(cycle);

  for (let i = 0; i < rollData.length; i++) {
    Storage.set(
      rollKey(cycle, rollData[i].address),
      u64ToBytes(rollData[i].rolls),
    );
  }
}

/**
 * Deletes roll data for a given cycle.
 * @param cycle - The cycle to delete roll data for.
 * @param nbToDelete - The number of roll entries to delete.
 */
export function _deleteCycle(cycle: u32, nbToDelete: i32): void {
  assert(Storage.has(recordedCycleKey(cycle)), 'Cycle not found');

  if (!Storage.has(deletingCycleKey(cycle))) {
    Storage.set(deletingCycleKey(cycle), boolToByte(true));
  }

  const rollKeys = getKeys(rollKeyPrefix(cycle));

  if (nbToDelete > rollKeys.length) {
    nbToDelete = rollKeys.length;
  }

  for (let i = 0; i < nbToDelete; i++) {
    Storage.del(rollKeys[i]);
  }

  if (rollKeys.length === nbToDelete) {
    Storage.del(recordedCycleKey(cycle));
    Storage.del(deletingCycleKey(cycle));
  }
}
