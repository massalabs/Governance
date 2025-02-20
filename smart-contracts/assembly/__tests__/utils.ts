import { Args } from '@massalabs/as-types';
import { RollEntry } from '../contracts/serializable/roll-entry';

export function getRollsArgs(
  rollData: RollEntry[],
  cycle: u64,
  isLastBatch: boolean = true,
): StaticArray<u8> {
  return new Args()
    .addSerializableObjectArray<RollEntry>(rollData)
    .add(cycle)
    .add(isLastBatch)
    .serialize();
}
