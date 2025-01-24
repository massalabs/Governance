import { u32ToBytes, bytesToU32, u64ToBytes } from '@massalabs/as-types';
import { getKeys, Storage } from '@massalabs/massa-as-sdk';
import { RollEntry } from '../serializable/roll-entry';
import {
  LAST_CYCLE_TAG,
  recordedCycleKey,
  rollKey,
  rollKeyPrefix,
} from './keys';

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

export function _feedCycle(cycle: u32, rollData: RollEntry[]): void {
  validateAndSetCycle(cycle);

  for (let i = 0; i < rollData.length; i++) {
    Storage.set(
      rollKey(cycle, rollData[i].address),
      u64ToBytes(rollData[i].rolls),
    );
  }
}

export function _deleteCycle(cycle: u32): void {
  assert(Storage.has(recordedCycleKey(cycle)), 'Cycle not found');

  const rollKeys = getKeys(rollKeyPrefix(cycle));

  for (let i = 0; i < rollKeys.length; i++) {
    Storage.del(rollKeys[i]);
  }
}
