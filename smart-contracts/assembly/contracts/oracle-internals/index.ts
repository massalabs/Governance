import { u64ToBytes, bytesToU64, boolToByte } from '@massalabs/as-types';
import {
  getKeysPage,
  MAX_DATASTORE_KEYS_PAGE,
  Storage,
} from '@massalabs/massa-as-sdk';
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
  assert(
    cycle > lastCycle,
    `Cycle ${cycle} cannot be lower than the last cycle ${lastCycle}`,
  );
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

  // From MIP-0002, one datastore-key call returns at most MAX_DATASTORE_KEYS_PAGE keys: delete the
  // batch one page at a time. Deleted keys leave the datastore, so each page starts from the beginning.
  const prefix = rollKeyPrefix(cycle);
  let remaining = nbToDelete;
  let exhausted = false;
  while (remaining > 0 && !exhausted) {
    const count =
      remaining < u32(MAX_DATASTORE_KEYS_PAGE)
        ? i32(remaining)
        : MAX_DATASTORE_KEYS_PAGE;
    const rollKeys = getKeysPage(prefix, [], count);
    for (let i = 0; i < rollKeys.length; i++) {
      Storage.del(rollKeys[i]);
    }
    remaining -= u32(rollKeys.length);
    // A short page means no roll entry is left.
    exhausted = rollKeys.length < count;
  }

  if (exhausted || getKeysPage(prefix, [], 1).length === 0) {
    Storage.del(deletingKey);
  }
}

/**
 * Counts the roll entries of a cycle, one page of keys at a time.
 * @param cycle - The cycle to count the roll entries of.
 * @returns The number of stakers recorded for the cycle.
 */
export function _countRollEntries(cycle: u64): i32 {
  const prefix = rollKeyPrefix(cycle);
  let count = 0;
  let keys = getKeysPage(prefix);
  while (keys.length > 0) {
    count += keys.length;
    if (keys.length < MAX_DATASTORE_KEYS_PAGE) {
      break;
    }
    keys = getKeysPage(prefix, keys[keys.length - 1]);
  }
  return count;
}
