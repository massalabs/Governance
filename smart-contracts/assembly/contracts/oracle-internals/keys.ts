import { stringToBytes, u64ToBytes } from '@massalabs/as-types';

export const RECORDED_CYCLES_TAG = stringToBytes('RECORDED_CYCLES');
export const ORACLE_LAST_RECORDED_CYCLE = stringToBytes('LAST_CYCLE');
export const ROLLS_TAG = stringToBytes('ROLLS');
const DELETING_CYCLES_TAG = stringToBytes('DELETING_CYCLES');

export function recordedCycleKey(cycle: u64): StaticArray<u8> {
  return RECORDED_CYCLES_TAG.concat(u64ToBytes(cycle));
}

export function rollKeyPrefix(cycle: u64): StaticArray<u8> {
  return ROLLS_TAG.concat(u64ToBytes(cycle));
}

export function rollKey(cycle: u64, address: string): StaticArray<u8> {
  return rollKeyBytes(cycle, stringToBytes(address));
}

export function rollKeyBytes(
  cycle: u64,
  addressBytes: StaticArray<u8>,
): StaticArray<u8> {
  return rollKeyPrefix(cycle).concat(addressBytes);
}

// This key is used to tell that cycle is being deleted so the data can't be trusted
export const deletingCycleKey = (cycle: u64): StaticArray<u8> => {
  return DELETING_CYCLES_TAG.concat(u64ToBytes(cycle));
};
