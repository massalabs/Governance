import { Serializable, Result } from '@massalabs/as-types';
import { Args } from '@massalabs/as-types/assembly/argument';

export class RollEntry implements Serializable {
  constructor(public address: string = '', public rolls: u64 = 0) {}

  serialize(): StaticArray<u8> {
    return new Args().add(this.address).add(this.rolls).serialize();
  }

  deserialize(data: StaticArray<u8>, offset: i32): Result<i32> {
    const args = new Args(data, offset);

    const address = args.next<string>();
    if (address.isErr()) {
      return new Result(0, 'Error deserializing address.');
    }

    const rolls = args.next<u64>();
    if (rolls.isErr()) {
      return new Result(0, 'Error deserializing rolls.');
    }

    this.address = address.unwrap();
    this.rolls = rolls.unwrap();

    return new Result(args.offset);
  }
}
