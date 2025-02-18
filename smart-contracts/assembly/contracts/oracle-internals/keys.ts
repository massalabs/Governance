import { stringToBytes, u64ToBytes } from '@massalabs/as-types';

export const RECORDED_CYCLES_TAG = stringToBytes('RECORDED_CYCLES');
export const LAST_CYCLE_TAG = stringToBytes('LAST_CYCLE');
export const ROLLS_TAG = stringToBytes('ROLLS');

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
