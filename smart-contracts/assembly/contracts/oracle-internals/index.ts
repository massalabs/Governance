import { u64ToBytes, bytesToU64, boolToByte } from '@massalabs/as-types';
import { getKeys, Storage } from '@massalabs/massa-as-sdk';
import { RollEntry } from '../serializable/roll-entry';
import {
  deletingCycleKey,
  ORACLE_LAST_RECORDED_CYCLE,
  recordedCycleKey,
  rollKeyBytes,
  rollKeyPrefix,
} from './keys';

/**
 * Validates the given cycle and sets it if it is valid.
 * @param cycle - The cycle to validate and set.
 */
export function validateCycle(cycle: u64): void {
  const lastCycle = bytesToU64(Storage.get(ORACLE_LAST_RECORDED_CYCLE));
  assert(cycle > lastCycle, 'Cycle cannot be lower than the last cycle');
}

/**
 * Feeds roll data for a given cycle.
 * @param cycle - The cycle to feed roll data for.
 * @param rollData - An array of RollEntry objects containing the roll data.
 */
export function _feedCycle(
  rollData: RollEntry[],
  cycle: u64,
  isLastBatch: boolean,
): void {
  validateCycle(cycle);

  if (isLastBatch) {
    Storage.set(ORACLE_LAST_RECORDED_CYCLE, u64ToBytes(cycle));
    Storage.set(recordedCycleKey(cycle), []);
  }

  for (let i = 0; i < rollData.length; i++) {
    Storage.set(rollKeyBytes(cycle, rollData[i].address), rollData[i].rolls);
  }
}

/**
 * Deletes roll data for a given cycle.
 * @param cycle - The cycle to delete roll data for.
 * @param nbToDelete - The number of roll entries to delete.
 * @remarks This function is called in batches to avoid exceeding the gas limit.
 */
export function _deleteCycle(cycle: u64, nbToDelete: u32): void {
  const deletingKey = deletingCycleKey(cycle);
  const recordingCycleKey = recordedCycleKey(cycle);

  assert(
    Storage.has(recordingCycleKey) || Storage.has(deletingKey),
    'Cycle does not exist or has already been fully deleted',
  );

  if (!Storage.has(deletingKey)) {
    Storage.del(recordedCycleKey(cycle));
    Storage.set(deletingKey, boolToByte(true));
  }

  const rollKeys = getKeys(rollKeyPrefix(cycle));

  if (nbToDelete > u32(rollKeys.length)) {
    nbToDelete = rollKeys.length;
  }

  for (let i = u32(0); i < nbToDelete; i++) {
    Storage.del(rollKeys[i]);
  }

  if (rollKeys.length === nbToDelete) {
    Storage.del(deletingKey);
  }
}
