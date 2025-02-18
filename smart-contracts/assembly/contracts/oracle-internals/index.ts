import { u64ToBytes, bytesToU64, boolToByte } from '@massalabs/as-types';
import { Context, getKeys, Storage } from '@massalabs/massa-as-sdk';
import { RollEntry } from '../serializable/roll-entry';
import {
  LAST_CYCLE_TAG,
  recordedCycleKey,
  rollKey,
  rollKeyPrefix,
} from './keys';

const NB_PERIODS_IN_CYCLE = 128;

/**
 * Returns the current cycle.
 */
function getCurrentCycle(): u64 {
  return Context.currentPeriod() / NB_PERIODS_IN_CYCLE;
}

/**
 * Feeds roll data for a given cycle.
 * @param cycle - The cycle to feed roll data for.
 * @param rollData - An array of RollEntry objects containing the roll data.
 */
// TODO - Add and test melanism to tell cycle is not complete
export function _feedCycle(rollData: RollEntry[], isLastBatch: boolean): void {
  const cycle = getCurrentCycle();

  let lastCycle = bytesToU64(Storage.get(LAST_CYCLE_TAG));
  assert(cycle > lastCycle, 'Cycle should be greater than last cycle');

  if (isLastBatch) {
    Storage.set(LAST_CYCLE_TAG, u64ToBytes(cycle));
    Storage.set(recordedCycleKey(cycle), new StaticArray<u8>(0));
  }

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
 * @remarks This function is called in batches to avoid exceeding the gas limit.
 */
export function _deleteCycle(cycle: u64, nbToDelete: i32): void {
  if (Storage.has(recordedCycleKey(cycle))) {
    Storage.del(recordedCycleKey(cycle));
  }

  const rollKeys = getKeys(rollKeyPrefix(cycle));

  assert(rollKeys.length > 0, 'No roll data found for the given cycle');

  if (nbToDelete > rollKeys.length) {
    nbToDelete = rollKeys.length;
  }

  for (let i = 0; i < nbToDelete; i++) {
    Storage.del(rollKeys[i]);
  }
}
