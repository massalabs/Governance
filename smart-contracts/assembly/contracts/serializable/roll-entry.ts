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
  ) { }

  /**
   * Creates a new RollEntry object.
   * @param address - The address of the roll.
   * @param rolls - The rolls of the roll.
   * @returns A new RollEntry object.
   */
  static create(address: string, rolls: u64): RollEntry {
    return new RollEntry(stringToBytes(address), u64ToBytes(rolls));
  }

  /**
   * Serializes the RollEntry object into a byte array.
   * @returns A byte array representing the serialized RollEntry object.
   */
  serialize(): StaticArray<u8> {
    return new Args().add(this.address).add(this.rolls).serialize();
  }

  /**
   * Deserializes a byte array into a RollEntry object.
   * @param data - The byte array to deserialize.
   * @param offset - The offset to start deserialization from.
   * @returns A Result object containing the new offset or an error message.
   */
  deserialize(data: StaticArray<u8>, offset: u32): Result<u32> {
    const args = new Args(data, offset);

    const address = args.next<StaticArray<u8>>();
    if (address.isErr()) return new Result(0, 'Error deserializing address.');
    this.address = address.unwrap();

    const rolls = args.next<StaticArray<u8>>();
    if (rolls.isErr()) return new Result(0, 'Error deserializing rolls.');
    this.rolls = rolls.unwrap();

    return new Result(args.offset);
  }
}
