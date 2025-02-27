import { Serializable, Result } from '@massalabs/as-types';
import { Args } from '@massalabs/as-types/assembly/argument';

export class Vote implements Serializable {
  constructor(
    public proposalId: u64 = 0,
    public value: i32 = 0,
    public comment: StaticArray<u8> = [],
  ) {}

  /**
   * Serializes the Proposal object into a byte array.
   */
  serialize(): StaticArray<u8> {
    return new Args()
      .add(this.proposalId)
      .add(this.value)
      .add(this.comment)
      .serialize();
  }

  /**
   * Deserializes a byte array into a Proposal object.
   */
  deserialize(data: StaticArray<u8>, offset: u32): Result<u32> {
    const args = new Args(data, offset);

    const proposalId = args.next<u64>();
    if (proposalId.isErr())
      return new Result(0, 'Error deserializing proposalId');
    this.proposalId = proposalId.unwrap();

    const value = args.next<i32>();
    if (value.isErr()) return new Result(0, 'Error deserializing value');
    this.value = value.unwrap();

    const comment = args.next<StaticArray<u8>>();
    if (comment.isErr()) return new Result(0, 'Error deserializing comment');
    this.comment = comment.unwrap();

    return new Result(args.offset);
  }
}
