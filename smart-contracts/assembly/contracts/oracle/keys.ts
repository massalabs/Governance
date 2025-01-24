import { stringToBytes, u32ToBytes } from '@massalabs/as-types';

export const RECORDED_CYCLES_TAG = stringToBytes('RECORDED_CYCLES');
export const LAST_CYCLE_TAG = stringToBytes('LAST_CYCLE');
export const ROLLS_TAG = stringToBytes('ROLLS');

export function recordedCycleKey(cycle: u32): StaticArray<u8> {
  return RECORDED_CYCLES_TAG.concat(u32ToBytes(cycle));
}

export function rollKeyPrefix(cycle: u32): StaticArray<u8> {
  return ROLLS_TAG.concat(u32ToBytes(cycle));
}

export function rollKey(cycle: u32, address: string): StaticArray<u8> {
  return rollKeyPrefix(cycle).concat(stringToBytes(address));
}
