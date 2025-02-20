import {
  Serializable,
  Result,
  stringToBytes,
  u64ToBytes,
} from '@massalabs/as-types';
import { Args } from '@massalabs/as-types/assembly/argument';

export class RollEntry implements Serializable {
  constructor(
    public address: StaticArray<u8> = [],
    public rolls: StaticArray<u8> = [],
  ) {}

  static create(address: string, rolls: u64): RollEntry {
    return new RollEntry(stringToBytes(address), u64ToBytes(rolls));
  }

  serialize(): StaticArray<u8> {
    return new Args().add(this.address).add(this.rolls).serialize();
  }

  deserialize(data: StaticArray<u8>, offset: u32): Result<u32> {
    const args = new Args(data, offset);

    const address = args.next<StaticArray<u8>>();
    if (address.isErr()) {
      return new Result(0, 'Error deserializing address.');
    }

    const rolls = args.next<StaticArray<u8>>();
    if (rolls.isErr()) {
      return new Result(0, 'Error deserializing rolls.');
    }

    this.address = address.unwrap();
    this.rolls = rolls.unwrap();

    return new Result(args.offset);
  }
}
